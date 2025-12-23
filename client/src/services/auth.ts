import { api } from './api';
import type { User } from '../utils/types';

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export const googleLogin = async (credential: string): Promise<User> => {
  const { data } = await api.post('/auth/google', { credential });
  return data.user;
};

export const register = async (payload: AuthPayload): Promise<User> => {
  const { data } = await api.post('/auth/register', payload);
  return data.user;
};

export const login = async (payload: AuthPayload): Promise<User> => {
  const { data } = await api.post('/auth/login', payload);
  return data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const fetchMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

