const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 150
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    summary: {
      type: String,
      maxlength: 200,
      default: ''
    },
    coverImageUrl: {
      type: String,
      maxlength: 400000,
      default: ''
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    shares: {
      type: Number,
      default: 0,
      min: 0
    },
    comments: [
      {
        name: {
          type: String,
          trim: true,
          maxlength: 80,
          default: 'Reader'
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 600
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    publishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

