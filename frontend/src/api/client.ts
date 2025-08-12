import axios from 'axios';
import { useAuth } from '@/stores/authStore';

// 🔥 토큰 갱신 전용 axios 인스턴스 (인터셉터 없음)
const authApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

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
  if (import.meta.env.DEV) {
    console.log('[API REQUEST]', config.method?.toUpperCase(), config.url, config.data || '');
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  res => {
    if (import.meta.env.DEV) {
      console.log('[API RESPONSE]', res.config.url, res.data);
    }
    return res;
  },
  async error => {
    const { response } = error;
    const originalRequest = error.config;

    if (response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }
      // 🔥 이미 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔥 별도 인스턴스로 토큰 갱신 (인터셉터 작동 안함)
        const refreshRes = await authApi.post('/auth/refresh', {});
        
        console.log('[API] Token refresh successful');
        
        processQueue(null);
        
        // 원래 요청 재시도
        return api(originalRequest);

      } catch (err) {
        console.log('[API] Token refresh failed - logging out');
        
        processQueue(err);
        
        try {
          await useAuth.getState().logout();
        } catch (logoutError) {
          console.error('[API] Logout error:', logoutError);
        }
        
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (import.meta.env.DEV) {
      console.error('[API ERROR]', response?.config?.url, response?.data || error.message);
    }
    return Promise.reject(error);
  },
);