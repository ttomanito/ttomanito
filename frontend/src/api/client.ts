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
  console.log(import.meta.env.VITE_API_URL);
  console.log(import.meta.env.VITE_BASE_URL);
  console.log(config.baseURL);
  // 예: 로컬스토리지에 저장된 토큰 가져오기
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0Mjc0MTMwLCJleHAiOjE3NTQzMDI5MzB9.dsRMODLGw5DmSHkEKgEbV0FftjUyrYgdX31R3Jp0hQ0';
  // 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0Mjc0MTU3LCJleHAiOjE3NTQzMDI5NTd9.6WTkjRv3RGIafG7ZkA9NvxZn1mp9-ZZ-jd-u2DjPEEc';
  // const token = localStorage.getItem('accessToken'); // 또는 sessionStorage

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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

