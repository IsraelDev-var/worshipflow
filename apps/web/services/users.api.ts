import { authRequest } from './apiClient';
import type { User, ApiResponse, PaginatedResponse } from '@/types';

export const usersApi = {
  list: (page = 1, limit = 50) =>
    authRequest<ApiResponse<PaginatedResponse<User>>>(`/users?page=${page}&limit=${limit}`),

  findById: (id: string) => authRequest<ApiResponse<User>>(`/users/${id}`),

  update: (id: string, payload: Partial<Pick<User, 'firstName' | 'lastName'>>) =>
    authRequest<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deactivate: (id: string) => authRequest<ApiResponse<User>>(`/users/${id}`, { method: 'DELETE' }),
};
