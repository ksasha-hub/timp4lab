import axios from 'axios';

let accessToken = localStorage.getItem('accessToken') ?? '';

export const setAccessToken = (token: string) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = ['Bearer', accessToken].join(' ');
  }
  return config;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as { _retry?: boolean; url?: string };
    const status = error.response?.status as number | undefined;

    if (status === 401 && !original?._retry && !String(original?.url).includes('/auth/refresh')) {
      original._retry = true;
      refreshing = refreshing ?? api.post('/auth/refresh').then((res) => {
        setAccessToken(res.data.accessToken as string);
      }).finally(() => {
        refreshing = null;
      });

      await refreshing;
      return api(original);
    }

    if (status === 401 || status === 403) {
      setAccessToken('');
    }

    throw error;
  }
);
