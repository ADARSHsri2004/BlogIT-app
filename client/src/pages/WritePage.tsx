import { type ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenText,
  CircleDot,
  Copy,
  FileText,
  ImagePlus,
  RefreshCcw,
  Sparkles,
  Tags,
  Trash2
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import MarkdownEditor from '../components/MarkdownEditor';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { createBlog, fetchBlogBySlug, regenerateBlogMetadata, updateBlog } from '../services/blogs';
import { AnimatedButton } from '../components/animate-ui/button';
import { softTransition, springTransition } from '../components/animate-ui/transitions';
import type { Blog, GeneratedMetadata } from '../utils/types';

const activeProcessingStates = new Set(['queued', 'processing']);

const getMetadataStatusLabel = (metadata?: GeneratedMetadata) => {
  switch (metadata?.processingStatus) {
    case 'queued':
      return 'Queued';
    case 'processing':
      return 'Generating';
    case 'completed':
      return 'Ready';
    case 'fallback':
      return 'Fallback Ready';
    case 'failed':
      return 'Needs Attention';
    default:
      return 'Waiting';
  }
};

const getMetadataStatusTone = (metadata?: GeneratedMetadata) => {
  switch (metadata?.processingStatus) {
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'fallback':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300';
    case 'queued':
    case 'processing':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-300';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300';
  }
};

const copyToClipboard = async (value: string, onSuccess: () => void) => {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  onSuccess();
};

const WritePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [titleDraft, setTitleDraft] = useState<string>();
  const [contentDraft, setContentDraft] = useState<string>();
  const [statusDraft, setStatusDraft] = useState<'draft' | 'published'>();
  const [coverImageUrlDraft, setCoverImageUrlDraft] = useState<string>();
  const [coverImageError, setCoverImageError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const {
    data: existing,
    isLoading: isLoadingExisting,
    error: existingError
  } = useQuery({
    queryKey: ['blog', slug, 'edit'],
    queryFn: () => fetchBlogBySlug(slug || ''),
    enabled: Boolean(slug),
    refetchInterval: (query) => {
      const metadata = (query.state.data as Blog | undefined)?.generatedMetadata;
      return metadata?.processingStatus && activeProcessingStates.has(metadata.processingStatus) ? 2500 : false;
    }
  });

  const title = titleDraft ?? existing?.title ?? '';
  const content = contentDraft ?? existing?.content ?? '# Start writing your story...';
  const status = statusDraft ?? existing?.status ?? 'draft';
  const coverImageUrl = coverImageUrlDraft ?? existing?.coverImageUrl ?? '';

  const mutation = useMutation({
    mutationFn: async () => {
      if (slug && existing) {
        return updateBlog(existing._id, { title, content, status, coverImageUrl });
      }
      return createBlog({ title, content, status, coverImageUrl });
    },
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', blog.slug] });
      queryClient.invalidateQueries({ queryKey: ['blog', blog.slug, 'edit'] });
      navigate(blog.status === 'draft' ? `/write/${blog.slug}` : `/blog/${blog.slug}`);
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!existing?._id) {
        throw new Error('Save the story once before regenerating metadata.');
      }
      return regenerateBlogMetadata(existing._id);
    },
    onSuccess: (blog) => {
      queryClient.setQueryData(['blog', blog.slug, 'edit'], blog);
      queryClient.invalidateQueries({ queryKey: ['blog', blog.slug] });
    }
  });

  if (isLoadingExisting) return <Spinner />;
  if (existingError) {
    return <EmptyState title="Cannot edit this blog" description={existingError.message} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read the selected image'));
      reader.readAsDataURL(file);
    });

  const handleCoverImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      setCoverImageError('Please choose a cover image under 300 KB.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCoverImageUrlDraft(dataUrl);
      setCoverImageError('');
    } catch (error) {
      setCoverImageError(error instanceof Error ? error.message : 'Could not read the selected image.');
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = Math.max(1, Math.ceil(wordCount / 220));
  const metadata = existing?.generatedMetadata;
  const isMetadataActive = Boolean(metadata?.processingStatus && activeProcessingStates.has(metadata.processingStatus));
  const hasMetadata =
    Boolean(metadata?.seoTitle) ||
    Boolean(metadata?.metaDescription) ||
    Boolean(metadata?.categories?.length) ||
    Boolean(metadata?.tags?.length) ||
    Boolean(metadata?.tldrBullets?.length);

  return (
    <MainLayout contentClassName="px-3 py-5 sm:px-4 lg:px-5 xl:px-6">
      <motion.section
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={softTransition}
      >
        <motion.div
          className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(245,248,255,0.95),rgba(255,255,255,0.98))] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...softTransition, delay: 0.04 }}
        >
          <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {slug ? 'Edit Story' : 'Writing Studio'}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink dark:text-slate-50 sm:text-4xl">
                {slug ? 'Refine your draft' : 'Create a new story'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Every save queues the metadata and repurposing engine in the background, so your SEO fields, tags, TL;DR,
                and social copy fill in without interrupting writing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                {wordCount} words
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <BookOpenText className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                {estimatedRead} min read
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.08 }}
            >
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="A compelling headline"
                className="mt-4 w-full border-0 bg-transparent p-0 font-serif text-3xl font-semibold text-ink outline-none placeholder:text-slate-300 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-600 sm:text-4xl"
                required
              />
            </motion.div>

            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.12 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Cover Image</label>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300">
                    <ImagePlus className="h-4 w-4" />
                    {coverImageUrl ? 'Replace cover' : 'Upload cover'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                  {coverImageUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageUrlDraft('');
                        setCoverImageError('');
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/70">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="" className="h-56 w-full object-cover sm:h-72" />
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500 dark:text-slate-400 sm:h-72">
                    <ImagePlus className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Add a visual anchor for your story</p>
                    <p className="max-w-md text-sm leading-6">
                      Upload a cover image to replace the default editorial artwork on the blog page and in the feed.
                    </p>
                  </div>
                )}
              </div>
              {coverImageError ? (
                <p className="mt-3 text-sm text-red-600 dark:text-red-300">{coverImageError}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">PNG, JPG, WEBP, or GIF. Keep it under 300 KB for fast loading.</p>
              )}
            </motion.div>

            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.16 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Content</label>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
                  Markdown editor
                </div>
              </div>
              <div className="mt-4">
                <MarkdownEditor value={content} onChange={setContentDraft} />
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Status</label>
                <div className="relative">
                  <CircleDot className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={status}
                    onChange={(e) => setStatusDraft(e.target.value as 'draft' | 'published')}
                    className="rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm font-medium text-ink outline-none transition focus:border-cyan-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {mutation.error ? (
                  <span className="text-sm text-red-600 dark:text-red-300">{(mutation.error as Error).message}</span>
                ) : null}
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={springTransition}>
                  <AnimatedButton type="submit" disabled={mutation.isPending} size="lg" className="min-w-36 shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
                    {mutation.isPending ? 'Saving...' : status === 'draft' ? (slug ? 'Save Draft' : 'Create Draft') : slug ? 'Update & Publish' : 'Publish Story'}
                  </AnimatedButton>
                </motion.div>
              </div>
            </motion.div>

            <motion.section
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.24 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Automated Metadata & Repurposing
                  </p>
                  <h2 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-slate-50">AI packaging layer</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    This panel fills in after save. If no LLM is configured, BlogIT still generates reliable fallback metadata so publishing never stalls.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${getMetadataStatusTone(metadata)}`}>
                    {getMetadataStatusLabel(metadata)}
                  </span>
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!existing || regenerateMutation.isPending || mutation.isPending}
                    onClick={() => regenerateMutation.mutate()}
                  >
                    <RefreshCcw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                    Regenerate
                  </AnimatedButton>
                </div>
              </div>

              {metadata?.lastProcessedAt ? (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Last processed {new Date(metadata.lastProcessedAt).toLocaleString()} via {metadata.provider || 'metadata engine'}.
                </p>
              ) : null}

              {regenerateMutation.error ? (
                <p className="mt-4 text-sm text-red-600 dark:text-red-300">{(regenerateMutation.error as Error).message}</p>
              ) : null}

              {isMetadataActive ? (
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-cyan-200 bg-cyan-50/70 px-4 py-4 text-sm text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-200">
                  The engine is working on this draft right now. Keep writing if you want. This page will refresh the results automatically.
                </div>
              ) : null}

              {!existing ? (
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                  Save the story once to trigger the pipeline and persist the generated metadata.
                </div>
              ) : null}

              {existing && !hasMetadata && !isMetadataActive ? (
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                  No metadata has been generated yet. Save or regenerate to populate this section.
                </div>
              ) : null}

              {hasMetadata ? (
                <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">SEO Title</p>
                        {metadata?.seoTitle ? (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(metadata.seoTitle || '', () => setCopiedField('seo-title'))}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === 'seo-title' ? 'Copied' : 'Copy'}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink dark:text-slate-100">{metadata?.seoTitle || 'Pending...'}</p>
                    </div>

                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Meta Description</p>
                        {metadata?.metaDescription ? (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(metadata.metaDescription || '', () => setCopiedField('meta-description'))}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedField === 'meta-description' ? 'Copied' : 'Copy'}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{metadata?.metaDescription || 'Pending...'}</p>
                    </div>

                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">SEO Slug</p>
                      <p className="mt-3 text-sm font-medium text-ink dark:text-slate-100">{metadata?.seoSlug || existing?.slug || 'Pending...'}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Categories</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(metadata?.categories || []).map((category) => (
                          <span
                            key={category}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Tags</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(metadata?.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">TL;DR Bullets</p>
                    <div className="mt-4 grid gap-3">
                      {(metadata?.tldrBullets || []).map((bullet) => (
                        <div key={bullet} className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Twitter Copy</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{metadata?.socialCopy?.twitter || 'Pending...'}</p>
                  </div>

                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">LinkedIn Copy</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{metadata?.socialCopy?.linkedin || 'Pending...'}</p>
                  </div>
                </div>
              ) : null}

              {metadata?.validationErrors?.length ? (
                <div className="mt-5 rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-4 py-4 dark:border-amber-900/70 dark:bg-amber-950/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">Validation Notes</p>
                  <div className="mt-3 space-y-2 text-sm text-amber-800 dark:text-amber-200">
                    {metadata.validationErrors.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.section>
          </form>
        </motion.div>
      </motion.section>
    </MainLayout>
  );
};

export default WritePage;
