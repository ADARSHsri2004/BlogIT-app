import { api } from './api';
import type { Blog } from '../utils/types';

export interface BlogPayload {
  title: string;
  content: string;
  status?: 'draft' | 'published';
  summary?: string;
  coverImageUrl?: string;
}

export const fetchPublishedBlogs = async (): Promise<Blog[]> => {
  const { data } = await api.get('/blogs');
  return data.blogs;
};

export const fetchMyBlogs = async (): Promise<Blog[]> => {
  const { data } = await api.get('/blogs/me');
  return data.blogs;
};

export const fetchBlogBySlug = async (slug: string): Promise<Blog> => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data.blog;
};

export const createBlog = async (payload: BlogPayload): Promise<Blog> => {
  const { data } = await api.post('/blogs', payload);
  return data.blog;
};

export const updateBlog = async (id: string, payload: BlogPayload): Promise<Blog> => {
  const { data } = await api.put(`/blogs/${id}`, payload);
  return data.blog;
};

export const deleteBlog = async (id: string): Promise<void> => {
  await api.delete(`/blogs/${id}`);
};

export const likeBlog = async (id: string): Promise<Blog> => {
  const { data } = await api.post(`/blogs/${id}/like`);
  return data.blog;
};

export const shareBlog = async (id: string): Promise<Blog> => {
  const { data } = await api.post(`/blogs/${id}/share`);
  return data.blog;
};

export const commentOnBlog = async (id: string, payload: { name?: string; message: string }): Promise<Blog> => {
  const { data } = await api.post(`/blogs/${id}/comments`, payload);
  return data.blog;
};

