export type BlogStatus = 'draft' | 'published';
export type UserRole = 'admin' | 'author' | 'reader';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImageUrl?: string;
  status: BlogStatus;
  author: User;
  generatedMetadata?: GeneratedMetadata;
  likes?: number;
  shares?: number;
  comments?: BlogComment[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface BlogComment {
  _id?: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface GeneratedMetadata {
  seoSlug?: string;
  seoTitle?: string;
  metaDescription?: string;
  categories?: string[];
  tags?: string[];
  tldrBullets?: string[];
  socialCopy?: {
    twitter?: string;
    linkedin?: string;
  };
  processingStatus?: 'idle' | 'queued' | 'processing' | 'completed' | 'fallback' | 'failed';
  sourceFingerprint?: string;
  lastRequestedAt?: string;
  lastProcessedAt?: string;
  validationErrors?: string[];
  fallbackReason?: string;
  provider?: string;
}

