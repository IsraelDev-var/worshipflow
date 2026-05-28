import { authRequest } from './apiClient';
import type { Category, ApiResponse } from '@/types';

export const categoriesApi = {
  list: () => authRequest<ApiResponse<Category[]>>('/categories'),

  create: (payload: { name: string; color?: string }) =>
    authRequest<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: { name?: string; color?: string }) =>
    authRequest<ApiResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) => authRequest<void>(`/categories/${id}`, { method: 'DELETE' }),
};
