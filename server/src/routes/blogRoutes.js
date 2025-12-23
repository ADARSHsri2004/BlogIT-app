const express = require('express');
const {
  createBlog,
  listPublished,
  listMine,
  getBySlug,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPublished);
router.get('/me', auth, listMine);
router.get('/:slug', optionalAuth, getBySlug); // allows drafts when requester is author
router.post('/', auth, createBlog);
router.put('/:id', auth, updateBlog);
router.delete('/:id', auth, deleteBlog);

module.exports = router;

