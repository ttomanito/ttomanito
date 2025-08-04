import axios from 'axios';

/**
 * axios 인스턴스 생성
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

// 요청 인터셉터 (개발 모드에서만 콘솔 로그)
api.interceptors.request.use(config => {
  //   console.log(config.baseURL);
  if (import.meta.env.DEV) {
    console.log('[API REQUEST]', config.method?.toUpperCase(), config.url, config.data || '');
  }
  return config;
});

// 응답 인터셉터 (개발 모드 + 에러 핸들링)
api.interceptors.response.use(
  res => {
    if (import.meta.env.DEV) {
      console.log('[API RESPONSE]', res.config.url, res.data);
    }
    return res;
  },
  error => {
    const { response } = error;
    if (import.meta.env.DEV) {
      console.error('[API ERROR]', response?.config?.url, response?.data || error.message);
    }

    return Promise.reject(error);
  },
);
