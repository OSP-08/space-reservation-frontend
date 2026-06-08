import axios, { AxiosError } from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import type { ApiResponse } from './types';

export const http = axios.create({
  baseURL: '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;

    if (status === 401) {
      const auth = useAuthStore();
      auth.clearSession();
      if (router.currentRoute.value.name !== 'login') {
        await router.push({ name: 'login' });
      }
    }

    return Promise.reject(error);
  }
);

export function unwrap<T>(response: { data: ApiResponse<T> }) {
  return response.data.data;
}

export function errorMessage(error: unknown, fallback = '요청 실패, 나중에 다시 시도하세요') {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
}