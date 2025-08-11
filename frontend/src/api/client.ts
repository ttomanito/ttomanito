import axios from 'axios';
import { useAuth } from '@/stores/authStore';

/**
 * src/api/client.ts
 * axios 인스턴스 생성 - 토큰 리프레시 race condition 해결
 */

// 🔥 리프레시 상태 관리 변수들
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];
let isLoggingOut = false;

// 🔥 리프레시 대기열 관리 함수들
const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 🔥 로그아웃 처리 함수
const handleLogout = async () => {
  console.log('[API] Starting logout process...');
  isLoggingOut = true;
  isRefreshing = false;
  
  // 대기 중인 모든 요청 거부
  onRefreshed(null);
  
  try {
    // authStore의 logout 함수 호출 (서버 로그아웃 + 상태 초기화)
    await useAuth.getState().logout();
    console.log('[API] Logout completed successfully');
  } catch (error) {
    console.error('[API] Logout error:', error);
  } finally {
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
};

// 🔥 외부에서 호출할 로그아웃 함수 (컴포넌트에서 사용)
export const logout = () => {
  handleLogout();
};

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

// 🔥 요청 인터셉터
api.interceptors.request.use(
  config => {
    // 로그아웃 중이면 모든 요청 차단
    if (isLoggingOut) {
      console.log('[API] Request blocked - logging out');
      return Promise.reject(new Error('User is logging out'));
    }

    // 토큰 추가
    const token = useAuth.getState().tokens.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log('[API REQUEST]', config.method?.toUpperCase(), config.url, config.data || '');
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 🔥 응답 인터셉터
api.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.log('[API RESPONSE]', response.config.url, response.data);
    }
    return response;
  },
  async error => {
    const { response } = error;
    const originalRequest = error.config;

    // 로그아웃 중이면 에러 그대로 반환
    if (isLoggingOut) {
      console.log('[API] Response error ignored - logging out');
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 🔥 이미 리프레시 중이면 대기열에 추가
      if (isRefreshing) {
        console.log('[API] Adding request to refresh queue');
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              // 새 토큰으로 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              // 리프레시 실패
              reject(error);
            }
          });
        });
      }

      // 🔥 리프레시 시작
      console.log('[API] Starting token refresh');
      isRefreshing = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshResponse = await api.post('/auth/refresh', {});
        const newAccessToken = refreshResponse.data.accessToken;

        console.log('[API] Token refresh successful');

        // 새 토큰을 store에 저장
        useAuth.getState().setTokens({ 
          accessToken: newAccessToken, 
          refreshToken: null // refreshToken은 HttpOnly 쿠키에서 관리
        });

        // 🔥 대기 중인 모든 요청에게 새 토큰 전달
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // 🔥 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.log('[API] Token refresh failed');
        
        // 🔥 리프레시 실패 - 모든 대기 요청 거부하고 로그아웃
        onRefreshed(null);
        isRefreshing = false;
        handleLogout();
        
        return Promise.reject(refreshError);
      }
    }

    if (import.meta.env.DEV) {
      console.error('[API ERROR]', response?.config?.url, response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

// 🔥 로그아웃 이벤트 리스너 (필요시 사용)
window.addEventListener('auth:logout', () => {
  console.log('[API] Logout event received');
  handleLogout();
});