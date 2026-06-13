const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'author', 'reader'],
      default: 'author'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetTokenHash: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    refreshTokenHash: {
      type: String,
      select: false
    },
    refreshTokenExpires: {
      type: Date,
      select: false
    },
    bio: {
      type: String,
      maxlength: 160,
      default: ''
    },
    avatarUrl: {
      type: String,
      maxlength: 400000,
      default: ''
    },
    coverImageUrl: {
      type: String,
      maxlength: 400000,
      default: ''
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

