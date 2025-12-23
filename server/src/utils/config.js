const dotenv = require('dotenv');

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogit',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  COOKIE_NAME: 'blogit_token',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
};

module.exports = config;

