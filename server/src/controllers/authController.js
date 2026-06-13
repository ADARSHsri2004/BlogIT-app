const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { createRawToken, hashToken } = require('../utils/token');
const { sendEmail } = require('../utils/mailer');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_DAYS,
  CLIENT_URL,
  NODE_ENV,
  GOOGLE_CLIENT_ID
} = require('../utils/config');

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const isProduction = NODE_ENV === 'production';
const baseCookieOptions = {
  httpOnly: true,
  // Vercel frontend + Render API are cross-site in production, so cookies
  // must be marked for cross-site delivery over HTTPS.
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction
};

const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000
};

const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/auth'
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  coverImageUrl: user.coverImageUrl,
  role: user.role,
  emailVerified: user.emailVerified
});

const isAllowedImageDataUrl = (value) =>
  typeof value === 'string' &&
  /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value) &&
  value.length <= 400000;

const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

const signRefreshToken = (user, tokenId) =>
  jwt.sign({ id: user._id, tokenId }, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, baseCookieOptions);
  res.clearCookie(REFRESH_COOKIE_NAME, { ...baseCookieOptions, path: '/api/auth' });
};

const issueAuthCookies = async (res, user) => {
  const accessToken = signAccessToken(user);
  const tokenId = createRawToken();
  const refreshToken = signRefreshToken(user, tokenId);

  user.refreshTokenHash = hashToken(tokenId);
  user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  await user.save();

  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const sendVerificationEmail = async (user) => {
  const token = createRawToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const url = `${CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your BlogIT email',
    text: `Verify your BlogIT email by opening this link: ${url}`,
    html: `<p>Verify your BlogIT email by opening this link:</p><p><a href="${url}">${url}</a></p>`
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedRole = ['author', 'reader'].includes(role) ? role : 'author';
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: normalizedRole });
  await sendVerificationEmail(user);

  return res.status(201).json({
    message: 'Account created. Check your email to verify your account before signing in.',
    user: publicUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.emailVerified) {
    return res.status(403).json({ message: 'Please verify your email before signing in' });
  }

  await issueAuthCookies(res, user);
  return res.json({ user: publicUser(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(payload.id).select('+refreshTokenHash +refreshTokenExpires');
  const tokenMatches = user?.refreshTokenHash && user.refreshTokenHash === hashToken(payload.tokenId);
  const tokenFresh = user?.refreshTokenExpires && user.refreshTokenExpires > new Date();
  if (!tokenMatches || !tokenFresh) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  await issueAuthCookies(res, user);
  return res.json({ user: publicUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { refreshTokenHash: 1, refreshTokenExpires: 1 }
    });
  }
  clearAuthCookies(res);
  return res.json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user: publicUser(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { bio, avatarUrl, coverImageUrl } = req.body;

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 160) {
      return res.status(400).json({ message: 'Bio must be 160 characters or fewer' });
    }
    user.bio = bio.trim();
  }

  if (avatarUrl !== undefined) {
    if (avatarUrl !== '' && !isAllowedImageDataUrl(avatarUrl)) {
      return res.status(400).json({ message: 'Avatar image must be a PNG, JPG, WEBP, or GIF under 400 KB' });
    }
    user.avatarUrl = avatarUrl || '';
  }

  if (coverImageUrl !== undefined) {
    if (coverImageUrl !== '' && !isAllowedImageDataUrl(coverImageUrl)) {
      return res.status(400).json({ message: 'Cover image must be a PNG, JPG, WEBP, or GIF under 400 KB' });
    }
    user.coverImageUrl = coverImageUrl || '';
  }

  await user.save();
  return res.json({ user: publicUser(user), message: 'Profile updated' });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) {
    return res.status(400).json({ message: 'Verification link is invalid or expired' });
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await issueAuthCookies(res, user);

  return res.json({ message: 'Email verified', user: publicUser(user) });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (user && !user.emailVerified) {
    await sendVerificationEmail(user);
  }

  return res.json({ message: 'If an unverified account exists, a verification email has been sent.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (user) {
    const token = createRawToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const url = `${CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your BlogIT password',
      text: `Reset your BlogIT password by opening this link: ${url}`,
      html: `<p>Reset your BlogIT password by opening this link:</p><p><a href="${url}">${url}</a></p>`
    });
  }

  return res.json({ message: 'If that email exists, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or expired' });
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined;
  user.refreshTokenExpires = undefined;
  await user.save();
  clearAuthCookies(res);

  return res.json({ message: 'Password reset. You can now sign in.' });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }
  if (!googleClient) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
  } catch (error) {
    return res.status(401).json({ message: 'Google credential could not be verified' });
  }

  const payload = ticket.getPayload();
  if (!payload?.email) {
    return res.status(400).json({ message: 'Invalid Google payload' });
  }

  const email = payload.email.toLowerCase();
  const name = payload.name || email.split('@')[0];

  let user = await User.findOne({ email });
  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = await User.create({
      name,
      email,
      password: randomPassword,
      role: 'author',
      emailVerified: true
    });
  } else if (!user.emailVerified) {
    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  await issueAuthCookies(res, user);
  return res.json({ user: publicUser(user) });
});

module.exports = {
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
};
