const express = require('express');
const { register, login, logout, me, googleLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', auth, logout);
router.get('/me', auth, me);

module.exports = router;

