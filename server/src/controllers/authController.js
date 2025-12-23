const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET, COOKIE_NAME, NODE_ENV, GOOGLE_CLIENT_ID } = require('../utils/config');

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, bio: user.bio }
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

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return res.json({ user: { id: user._id, name: user.name, email: user.email, bio: user.bio } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production' });
  return res.json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user: { id: user._id, name: user.name, email: user.email, bio: user.bio } });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }
  if (!googleClient) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.name) {
    return res.status(400).json({ message: 'Invalid Google payload' });
  }

  const email = payload.email.toLowerCase();
  const name = payload.name;

  let user = await User.findOne({ email });
  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = await User.create({ name, email, password: randomPassword });
  }

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return res.json({ user: { id: user._id, name: user.name, email: user.email, bio: user.bio } });
});

module.exports = { register, login, logout, me, googleLogin };

