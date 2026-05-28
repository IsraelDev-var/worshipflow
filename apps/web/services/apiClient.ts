import { apiRequest } from './api';
import { useAuthStore } from '@/store/authStore';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function authRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken ?? '';
  try {
    return await apiRequest<T>(endpoint, { ...options, token });
  } catch (err: any) {
    if (err?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    throw err;
  }
}
