import { api } from './api';
import type { User, UserRole } from '../utils/types';

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  role?: Exclude<UserRole, 'admin'>;
}

export interface AuthResult {
  user: User;
  message?: string;
}

export interface ProfileUpdatePayload {
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}

export const googleLogin = async (credential: string): Promise<AuthResult> => {
  const { data } = await api.post('/auth/google', { credential });
  return data;
};

export const register = async (payload: AuthPayload): Promise<AuthResult> => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const login = async (payload: AuthPayload): Promise<AuthResult> => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const fetchMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export const updateProfile = async (payload: ProfileUpdatePayload): Promise<AuthResult> => {
  const { data } = await api.put('/auth/profile', payload);
  return data;
};

export const verifyEmail = async (token: string): Promise<AuthResult> => {
  const { data } = await api.post('/auth/verify-email', { token });
  return data;
};

export const resendVerification = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/resend-verification', { email });
  return data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

