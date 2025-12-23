export type BlogStatus = 'draft' | 'published';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: BlogStatus;
  author: User;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

