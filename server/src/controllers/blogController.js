const slugify = require('slugify');
const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');

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

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, status = 'draft', summary } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const slug = await buildSlug(title);
  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  const blog = await Blog.create({
    title,
    slug,
    content,
    status: normalizedStatus,
    author: req.user.id,
    summary: sanitizeSummary(content, summary),
    publishedAt: normalizedStatus === 'published' ? new Date() : undefined
  });

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
  const { title, content, status, summary } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this blog' });
  }

  if (title) {
    blog.title = title;
    blog.slug = await buildSlug(title, blog._id);
  }
  if (content) {
    blog.content = content;
  }
  if (summary !== undefined) {
    blog.summary = sanitizeSummary(blog.content, summary);
  }
  if (status) {
    const normalizedStatus = status === 'published' ? 'published' : 'draft';
    blog.status = normalizedStatus;
    if (normalizedStatus === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    if (normalizedStatus === 'draft') {
      blog.publishedAt = undefined;
    }
  }

  await blog.save();
  return res.json({ blog });
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

module.exports = {
  createBlog,
  listPublished,
  listMine,
  getBySlug,
  updateBlog,
  deleteBlog
};

