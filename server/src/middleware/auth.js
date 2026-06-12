const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, ACCESS_COOKIE_NAME } = require('../utils/config');

const auth = (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role, emailVerified: payload.emailVerified };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role, emailVerified: payload.emailVerified };
  } catch (error) {
    // Ignore invalid tokens for optional auth to keep route public
  }
  return next();
};

const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ message: 'Email verification required' });
  }
  return next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  return next();
};

module.exports = { auth, optionalAuth, requireVerifiedEmail, requireRole };

