const slugify = require('slugify');
const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const { markMetadataQueued, queueMetadataGeneration } = require('../services/metadataEngine');

const buildSlug = async (title, excludeId) => {
  const base = slugify(title, { lower: true, strict: true }) || 'post';
  let candidate = base;
  let suffix = 1;

  // Ensure uniqueness even when updating an existing blog
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Blog.findOne({ slug: candidate, _id: { $ne: excludeId } });
    if (!existing) break;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

const sanitizeSummary = (content, summary) => {
  if (summary) return summary.trim().slice(0, 200);
  const plain = content.replace(/[#*>_`~\-]/g, '').replace(/\s+/g, ' ').trim();
  return plain.slice(0, 180);
};

const isAllowedImageDataUrl = (value) =>
  typeof value === 'string' &&
  /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value) &&
  value.length <= 400000;

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, status = 'draft', summary, coverImageUrl } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  if (coverImageUrl !== undefined && coverImageUrl !== '' && !isAllowedImageDataUrl(coverImageUrl)) {
    return res.status(400).json({ message: 'Cover image must be a PNG, JPG, WEBP, or GIF under 400 KB' });
  }

  const slug = await buildSlug(title);
  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  const blog = new Blog({
    title,
    slug,
    content,
    status: normalizedStatus,
    author: req.user.id,
    summary: sanitizeSummary(content, summary),
    coverImageUrl: coverImageUrl || '',
    publishedAt: normalizedStatus === 'published' ? new Date() : undefined
  });
  markMetadataQueued(blog);
  await blog.save();
  queueMetadataGeneration(blog._id);

  return res.status(201).json({ blog });
});

const listPublished = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;
  const query = { status: 'published' };

  const blogs = await Blog.find({ status: 'published' })
    .populate('author', 'name email')
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Blog.countDocuments(query);
  return res.json({ blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const listMine = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ author: req.user.id }).sort({ updatedAt: -1 });
  return res.json({ blogs });
});

const getBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const blog = await Blog.findOne({ slug }).populate('author', 'name email');
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  const isAuthor = req.user?.id && blog.author._id.toString() === req.user.id;
  const isAdmin = req.user?.role === 'admin';
  if (blog.status === 'draft' && !isAuthor && !isAdmin) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  return res.json({ blog });
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, status, summary, coverImageUrl } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this blog' });
  }

  let shouldRegenerateMetadata = false;

  if (title) {
    blog.title = title;
    blog.slug = await buildSlug(title, blog._id);
    shouldRegenerateMetadata = true;
  }
  if (content) {
    blog.content = content;
    shouldRegenerateMetadata = true;
  }
  if (summary !== undefined) {
    blog.summary = sanitizeSummary(blog.content, summary);
  }
  if (coverImageUrl !== undefined) {
    if (coverImageUrl !== '' && !isAllowedImageDataUrl(coverImageUrl)) {
      return res.status(400).json({ message: 'Cover image must be a PNG, JPG, WEBP, or GIF under 400 KB' });
    }
    blog.coverImageUrl = coverImageUrl || '';
  }
  if (status) {
    const normalizedStatus = status === 'published' ? 'published' : 'draft';
    if (blog.status !== normalizedStatus) {
      shouldRegenerateMetadata = true;
    }
    blog.status = normalizedStatus;
    if (normalizedStatus === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    if (normalizedStatus === 'draft') {
      blog.publishedAt = undefined;
    }
  }

  if (shouldRegenerateMetadata) {
    markMetadataQueued(blog);
  }
  await blog.save();
  if (shouldRegenerateMetadata) {
    queueMetadataGeneration(blog._id);
  }
  return res.json({ blog });
});

const regenerateMetadata = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to regenerate metadata for this blog' });
  }

  markMetadataQueued(blog);
  await blog.save();
  queueMetadataGeneration(blog._id);

  return res.status(202).json({ blog, message: 'Metadata regeneration queued' });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this blog' });
  }

  await blog.deleteOne();
  return res.json({ message: 'Blog deleted' });
});

const likeBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findOneAndUpdate(
    { _id: id, status: 'published' },
    { $inc: { likes: 1 } },
    { new: true }
  ).populate('author', 'name email');

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  return res.json({ blog });
});

const shareBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findOneAndUpdate(
    { _id: id, status: 'published' },
    { $inc: { shares: 1 } },
    { new: true }
  ).populate('author', 'name email');

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  return res.json({ blog });
});

const commentOnBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = (req.body.name || 'Reader').trim().slice(0, 80) || 'Reader';
  const message = (req.body.message || '').trim().slice(0, 600);

  if (!message) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  const blog = await Blog.findOne({ _id: id, status: 'published' }).populate('author', 'name email');
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  blog.comments.push({ name, message });
  await blog.save();
  return res.status(201).json({ blog });
});

module.exports = {
  createBlog,
  listPublished,
  listMine,
  getBySlug,
  updateBlog,
  regenerateMetadata,
  deleteBlog,
  likeBlog,
  shareBlog,
  commentOnBlog
};

