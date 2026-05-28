import { authRequest } from './apiClient';
import type { Song, SongSection, PaginatedResponse, ApiResponse } from '@/types';

interface SongQuery {
  page?: number;
  limit?: number;
  search?: string;
  key?: string;
  categoryId?: string;
  sortBy?: 'title' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

interface CreateSongPayload {
  title: string;
  author?: string;
  originalKey: string;
  tempo?: number;
  timeSignature?: string;
  durationSeconds?: number;
  content: string;
  categoryIds?: string[];
}

interface CreateSectionPayload {
  type: string;
  order: number;
  content: string;
  label?: string;
}

function buildQuery(params: Record<string, unknown>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

export const songsApi = {
  list: (query: SongQuery = {}) =>
    authRequest<ApiResponse<PaginatedResponse<Song>>>(
      `/songs${buildQuery(query as Record<string, unknown>)}`,
    ),

  findById: (id: string) => authRequest<ApiResponse<Song>>(`/songs/${id}`),

  create: (payload: CreateSongPayload) =>
    authRequest<ApiResponse<Song>>('/songs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<CreateSongPayload>) =>
    authRequest<ApiResponse<Song>>(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) => authRequest<void>(`/songs/${id}`, { method: 'DELETE' }),

  transpose: (id: string, targetKey: string) =>
    authRequest<ApiResponse<Song>>(`/songs/${id}/transpose/${encodeURIComponent(targetKey)}`),

  getSections: (id: string) => authRequest<ApiResponse<SongSection[]>>(`/songs/${id}/sections`),

  createSection: (id: string, payload: CreateSectionPayload) =>
    authRequest<ApiResponse<SongSection>>(`/songs/${id}/sections`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSection: (id: string, sectionId: string, payload: Partial<CreateSectionPayload>) =>
    authRequest<ApiResponse<SongSection>>(`/songs/${id}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteSection: (id: string, sectionId: string) =>
    authRequest<void>(`/songs/${id}/sections/${sectionId}`, { method: 'DELETE' }),
};
