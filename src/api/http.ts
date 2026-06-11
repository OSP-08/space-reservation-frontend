import axios, { AxiosError } from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

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

interface BackendErrorResponse {
  code?: string;
  message?: string;
  status?: number;
  timestamp?: string;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorResponse>) => {
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

// 백엔드(Spring Boot)는 본문을 JSON 그대로 반환. 별도 래퍼 없음.
export function unwrap<T>(response: { data: T }): T {
  return response.data;
}

export function errorMessage(error: unknown, fallback = '요청 실패, 나중에 다시 시도하세요') {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
}
