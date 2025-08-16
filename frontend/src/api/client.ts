import axios from 'axios';
import { useAuth } from '@/stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

// 갱신 중인지 확인하는 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

// 요청 인터셉터
api.interceptors.request.use(config => {
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  res => {
    return res;
  },
  async error => {
    const { response } = error;
    const originalRequest = error.config;

    if (response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // 이미 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 별도 인스턴스로 토큰 갱신 (인터셉터 작동 안함)
        processQueue(null);

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (err) {
        processQueue(err);

        try {
          await useAuth.getState().logout();
        } catch {
          // logout 에러는 무시
        }

        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
