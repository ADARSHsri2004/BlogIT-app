const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/google', googleLogin);
router.post('/logout', auth, logout);
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

