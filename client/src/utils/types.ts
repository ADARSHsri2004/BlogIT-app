export type BlogStatus = 'draft' | 'published';
export type UserRole = 'admin' | 'author' | 'reader';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: BlogStatus;
  author: User;
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

