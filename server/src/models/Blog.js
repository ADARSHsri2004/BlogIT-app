const mongoose = require('mongoose');

const generatedMetadataSchema = new mongoose.Schema(
  {
    seoSlug: {
      type: String,
      trim: true,
      default: ''
    },
    seoTitle: {
      type: String,
      trim: true,
      default: ''
    },
    metaDescription: {
      type: String,
      trim: true,
      default: ''
    },
    categories: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    tldrBullets: {
      type: [String],
      default: []
    },
    socialCopy: {
      twitter: {
        type: String,
        trim: true,
        default: ''
      },
      linkedin: {
        type: String,
        trim: true,
        default: ''
      }
    },
    processingStatus: {
      type: String,
      enum: ['idle', 'queued', 'processing', 'completed', 'fallback', 'failed'],
      default: 'idle'
    },
    sourceFingerprint: {
      type: String,
      default: ''
    },
    lastRequestedAt: {
      type: Date
    },
    lastProcessedAt: {
      type: Date
    },
    validationErrors: {
      type: [String],
      default: []
    },
    fallbackReason: {
      type: String,
      trim: true,
      default: ''
    },
    provider: {
      type: String,
      trim: true,
      default: 'deterministic-fallback'
    }
  },
  { _id: false }
);

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
    generatedMetadata: {
      type: generatedMetadataSchema,
      default: () => ({})
    },
    publishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

