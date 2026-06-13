const crypto = require('crypto');
const slugify = require('slugify');
const Blog = require('../models/Blog');
const {
  METADATA_LLM_PROVIDER,
  METADATA_LLM_API_KEY,
  METADATA_LLM_API_URL,
  METADATA_LLM_MODEL,
  METADATA_LLM_TEMPERATURE,
  METADATA_LLM_TIMEOUT_MS
} = require('../utils/config');

const MAX_SEO_TITLE_LENGTH = 60;
const MAX_META_DESCRIPTION_LENGTH = 160;
const MAX_TLDR_ITEMS = 3;
const MAX_CATEGORY_COUNT = 3;
const MAX_TAG_COUNT = 6;

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'this',
  'to',
  'was',
  'we',
  'with',
  'your'
]);

const CATEGORY_RULES = [
  { name: 'Artificial Intelligence', matchers: ['ai', 'llm', 'language model', 'prompt', 'automation', 'machine learning'] },
  { name: 'System Design', matchers: ['architecture', 'pipeline', 'backend', 'database', 'scalable', 'system design'] },
  { name: 'SEO', matchers: ['seo', 'metadata', 'meta description', 'search ranking', 'slug', 'google'] },
  { name: 'Content Marketing', matchers: ['content marketing', 'audience', 'newsletter', 'distribution', 'social copy', 'repurposing'] },
  { name: 'Productivity', matchers: ['workflow', 'busywork', 'productivity', 'efficiency', 'save time'] },
  { name: 'Engineering', matchers: ['api', 'validation', 'webhook', 'json', 'schema', 'cms'] }
];

const cleanList = (items, limit) =>
  Array.from(
    new Set(
      (items || [])
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  ).slice(0, limit);

const trimSentence = (value, maxLength) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced.slice(0, maxLength)).trim();
};

const stripMarkup = (value) =>
  String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#~\-]+/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

const extractHeadings = (content) =>
  String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, '').trim())
    .filter(Boolean);

const splitSentences = (content) =>
  stripMarkup(content)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);

const toSlug = (value) => slugify(String(value || ''), { lower: true, strict: true, trim: true }) || 'post';

const fingerprintArticle = ({ title, content, status }) =>
  crypto.createHash('sha256').update(`${title || ''}\n${status || ''}\n${content || ''}`).digest('hex');

const detectCategories = (text) => {
  const normalized = text.toLowerCase();
  const matches = CATEGORY_RULES.filter((rule) => rule.matchers.some((matcher) => normalized.includes(matcher))).map((rule) => rule.name);
  return matches.length ? matches.slice(0, MAX_CATEGORY_COUNT) : ['Writing'];
};

const detectTags = (title, content) => {
  const keywordMatches = [];
  const normalized = `${title || ''} ${stripMarkup(content)}`.toLowerCase();
  const headingTags = extractHeadings(content)
    .flatMap((heading) => heading.split(/[:,-]/))
    .map((item) => item.trim())
    .filter((item) => item.length > 3);

  CATEGORY_RULES.forEach((rule) => {
    if (rule.matchers.some((matcher) => normalized.includes(matcher))) {
      keywordMatches.push(...rule.matchers.filter((matcher) => matcher.length > 3));
    }
  });

  const tokenScores = new Map();
  normalized
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .forEach((word) => {
      tokenScores.set(word, (tokenScores.get(word) || 0) + 1);
    });

  const frequentTokens = [...tokenScores.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, MAX_TAG_COUNT)
    .map(([word]) => word);

  return cleanList([...headingTags, ...keywordMatches, ...frequentTokens], MAX_TAG_COUNT);
};

const buildTldrBullets = (title, content) => {
  const headings = extractHeadings(content);
  const sentences = splitSentences(content);
  const titleIdea = title ? `This article explores ${title.replace(/[.!?]+$/, '').trim()}.` : '';
  return cleanList(
    [titleIdea, ...headings.map((heading) => `${heading}.`), ...sentences],
    MAX_TLDR_ITEMS
  ).map((item) => trimSentence(item, 140));
};

const createFallbackMetadata = ({ title, slug, content }) => {
  const cleanText = stripMarkup(content);
  const firstSentence = splitSentences(content)[0] || cleanText;
  const categories = detectCategories(`${title || ''} ${cleanText}`);
  const tags = detectTags(title, content);
  const seoTitleBase = title || 'Untitled story';
  const seoTitle = trimSentence(seoTitleBase, MAX_SEO_TITLE_LENGTH);
  const metaDescription = trimSentence(firstSentence || cleanText || seoTitleBase, MAX_META_DESCRIPTION_LENGTH);
  const tldrBullets = buildTldrBullets(title, content);
  const categoryLabel = categories[0] || 'Writing';

  return {
    seoSlug: toSlug(slug || title),
    seoTitle,
    metaDescription,
    categories,
    tags,
    tldrBullets,
    socialCopy: {
      twitter: trimSentence(`${seoTitle} ${metaDescription} Read the full story on BlogIT.`, 260),
      linkedin: trimSentence(`New ${categoryLabel.toLowerCase()} piece: ${seoTitle}. ${metaDescription}`, 400)
    }
  };
};

const buildPrompt = ({ title, slug, content, status }) => {
  const cleaned = stripMarkup(content);
  return [
    'You are a metadata engine for a publishing CMS.',
    'Return strict JSON only with these keys:',
    'seo_slug, seo_title, meta_description, categories, tags, tldr_bullets, social_copy.',
    'Rules:',
    '- seo_slug: lowercase kebab-case.',
    `- seo_title: max ${MAX_SEO_TITLE_LENGTH} characters.`,
    `- meta_description: max ${MAX_META_DESCRIPTION_LENGTH} characters.`,
    `- categories: array of 1 to ${MAX_CATEGORY_COUNT} concise labels.`,
    `- tags: array of 3 to ${MAX_TAG_COUNT} lowercase tags.`,
    `- tldr_bullets: array of exactly ${MAX_TLDR_ITEMS} bullets, each under 140 characters.`,
    '- social_copy must contain twitter and linkedin strings.',
    '- No markdown fences. No explanations. JSON only.',
    '',
    `Title: ${title || ''}`,
    `Slug: ${slug || ''}`,
    `Status: ${status || 'draft'}`,
    'Article:',
    cleaned
  ].join('\n');
};

const extractJsonStringFromResponse = (payload) => {
  if (!payload || typeof payload !== 'object') return '';

  if (Array.isArray(payload.candidates)) {
    const text = payload.candidates
      .flatMap((candidate) => candidate?.content?.parts || [])
      .map((part) => part?.text)
      .filter((value) => typeof value === 'string' && value.trim())
      .join('\n')
      .trim();

    if (text) return text;
  }

  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (Array.isArray(payload.choices) && payload.choices[0]?.message?.content) {
    const content = payload.choices[0].message.content;
    if (typeof content === 'string') return content.trim();
    if (Array.isArray(content)) {
      const textPart = content.find((item) => typeof item?.text === 'string');
      if (textPart?.text) return textPart.text.trim();
    }
  }

  if (Array.isArray(payload.content)) {
    const textPart = payload.content.find((item) => typeof item?.text === 'string');
    if (textPart?.text) return textPart.text.trim();
  }

  return '';
};

const parsePotentialJson = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    throw new Error('Empty LLM response');
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw error;
    return JSON.parse(match[0]);
  }
};

const validateMetadata = (payload, fallback) => {
  const validationErrors = [];
  const normalized = {
    seoSlug: toSlug(payload?.seo_slug || fallback.seoSlug),
    seoTitle: trimSentence(payload?.seo_title || fallback.seoTitle, MAX_SEO_TITLE_LENGTH),
    metaDescription: trimSentence(payload?.meta_description || fallback.metaDescription, MAX_META_DESCRIPTION_LENGTH),
    categories: cleanList(payload?.categories || fallback.categories, MAX_CATEGORY_COUNT),
    tags: cleanList(payload?.tags || fallback.tags, MAX_TAG_COUNT).map((tag) => tag.toLowerCase()),
    tldrBullets: cleanList(payload?.tldr_bullets || fallback.tldrBullets, MAX_TLDR_ITEMS).map((bullet) => trimSentence(bullet, 140)),
    socialCopy: {
      twitter: trimSentence(payload?.social_copy?.twitter || fallback.socialCopy.twitter, 260),
      linkedin: trimSentence(payload?.social_copy?.linkedin || fallback.socialCopy.linkedin, 400)
    }
  };

  if (!payload?.seo_title) validationErrors.push('Missing seo_title from LLM response');
  if (!payload?.meta_description) validationErrors.push('Missing meta_description from LLM response');
  if (!Array.isArray(payload?.categories) || !payload.categories.length) validationErrors.push('Missing categories array from LLM response');
  if (!Array.isArray(payload?.tags) || !payload.tags.length) validationErrors.push('Missing tags array from LLM response');
  if (!Array.isArray(payload?.tldr_bullets) || payload.tldr_bullets.length < MAX_TLDR_ITEMS) {
    validationErrors.push('Missing full tldr_bullets array from LLM response');
  }
  if (!payload?.social_copy?.twitter || !payload?.social_copy?.linkedin) {
    validationErrors.push('Missing social_copy channels from LLM response');
  }
  if (normalized.seoTitle.length > MAX_SEO_TITLE_LENGTH) validationErrors.push('seo_title exceeded max length');
  if (normalized.metaDescription.length > MAX_META_DESCRIPTION_LENGTH) validationErrors.push('meta_description exceeded max length');
  if (normalized.tldrBullets.length < MAX_TLDR_ITEMS) validationErrors.push('Not enough TLDR bullets after normalization');

  return {
    normalized,
    validationErrors
  };
};

const hasLlmConfiguration = () => Boolean(METADATA_LLM_API_URL && METADATA_LLM_API_KEY && METADATA_LLM_MODEL);

const buildGeminiApiUrl = () => METADATA_LLM_API_URL.replace('{model}', encodeURIComponent(METADATA_LLM_MODEL));

const requestLlmMetadata = async (blog) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), METADATA_LLM_TIMEOUT_MS);

  try {
    const response = await fetch(buildGeminiApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': METADATA_LLM_API_KEY
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'You transform long-form articles into strict JSON metadata for a CMS.'
            }
          ]
        },
        contents: [
          {
            parts: [
              {
                text: buildPrompt(blog)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: METADATA_LLM_TEMPERATURE,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return parsePotentialJson(extractJsonStringFromResponse(payload));
  } finally {
    clearTimeout(timeout);
  }
};

const persistMetadataResult = async (blog, metadata, overrides = {}) => {
  blog.generatedMetadata = {
    ...blog.generatedMetadata?.toObject?.(),
    ...metadata,
    ...overrides
  };
  blog.summary = metadata.metaDescription || blog.summary;
  await blog.save();
};

const processMetadataForBlog = async (blogId) => {
  const blog = await Blog.findById(blogId);
  if (!blog) return;

  const sourceFingerprint = fingerprintArticle(blog);
  if (
    blog.generatedMetadata?.processingStatus === 'completed' &&
    blog.generatedMetadata?.sourceFingerprint === sourceFingerprint
  ) {
    return;
  }

  blog.generatedMetadata = {
    ...blog.generatedMetadata?.toObject?.(),
    processingStatus: 'processing',
    sourceFingerprint,
    validationErrors: [],
    fallbackReason: '',
    provider: hasLlmConfiguration() ? METADATA_LLM_PROVIDER : 'deterministic-fallback'
  };
  await blog.save();

  const fallback = createFallbackMetadata(blog);

  try {
    if (!hasLlmConfiguration()) {
      await persistMetadataResult(blog, fallback, {
        processingStatus: 'fallback',
        validationErrors: ['LLM configuration missing; deterministic fallback applied.'],
        fallbackReason: 'Missing metadata LLM environment variables',
        lastProcessedAt: new Date(),
        provider: 'deterministic-fallback'
      });
      return;
    }

    const llmPayload = await requestLlmMetadata(blog);
    const { normalized, validationErrors } = validateMetadata(llmPayload, fallback);

    if (validationErrors.length) {
      await persistMetadataResult(blog, normalized, {
        processingStatus: 'fallback',
        validationErrors,
        fallbackReason: 'LLM response required normalization or fallback values',
        lastProcessedAt: new Date(),
        provider: METADATA_LLM_PROVIDER
      });
      return;
    }

    await persistMetadataResult(blog, normalized, {
      processingStatus: 'completed',
      validationErrors: [],
      fallbackReason: '',
      lastProcessedAt: new Date(),
      provider: METADATA_LLM_PROVIDER
    });
  } catch (error) {
    await persistMetadataResult(blog, fallback, {
      processingStatus: 'fallback',
      validationErrors: [error instanceof Error ? error.message : 'Metadata generation failed'],
      fallbackReason: 'LLM request failed; deterministic fallback applied',
      lastProcessedAt: new Date(),
      provider: hasLlmConfiguration() ? METADATA_LLM_PROVIDER : 'deterministic-fallback'
    });
  }
};

const queueMetadataGeneration = (blogId) => {
  setTimeout(() => {
    processMetadataForBlog(blogId).catch((error) => {
      process.stderr.write(`Metadata pipeline failed for blog ${blogId}: ${error?.message || error}\n`);
    });
  }, 0);
};

const markMetadataQueued = (blog) => {
  blog.generatedMetadata = {
    ...blog.generatedMetadata?.toObject?.(),
    processingStatus: 'queued',
    lastRequestedAt: new Date(),
    sourceFingerprint: fingerprintArticle(blog),
    validationErrors: [],
    fallbackReason: ''
  };
};

module.exports = {
  createFallbackMetadata,
  fingerprintArticle,
  markMetadataQueued,
  processMetadataForBlog,
  queueMetadataGeneration,
  stripMarkup
};
