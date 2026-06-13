const express = require('express');
const {
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
} = require('../controllers/blogController');
const { auth, optionalAuth, requireVerifiedEmail, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPublished);
router.get('/me', auth, listMine);
router.post('/:id/like', likeBlog);
router.post('/:id/share', shareBlog);
router.post('/:id/comments', commentOnBlog);
router.post('/:id/metadata/regenerate', auth, requireVerifiedEmail, requireRole('admin', 'author'), regenerateMetadata);
router.get('/:slug', optionalAuth, getBySlug); // allows drafts when requester is author
router.post('/', auth, requireVerifiedEmail, requireRole('admin', 'author'), createBlog);
router.put('/:id', auth, requireVerifiedEmail, requireRole('admin', 'author'), updateBlog);
router.delete('/:id', auth, requireVerifiedEmail, requireRole('admin', 'author'), deleteBlog);

module.exports = router;

