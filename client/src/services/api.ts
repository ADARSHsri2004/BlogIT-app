import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

let refreshPromise: Promise<void> | null = null;

const refreshSession = async () => {
  await axios.post(
    `${API_BASE}/auth/refresh`,
    {},
    {
      withCredentials: true
    }
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || '';
    const isAuthRefreshCall = requestUrl.includes('/auth/refresh');
    const shouldAttemptRefresh =
      !requestUrl.startsWith('/auth/') || requestUrl === '/auth/me' || requestUrl === '/auth/logout';

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRefreshCall && shouldAttemptRefresh) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshSession().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError: any) {
        const message = refreshError?.response?.data?.message || 'Authentication expired';
        return Promise.reject(new Error(message));
      }
    }

    const message = error?.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

