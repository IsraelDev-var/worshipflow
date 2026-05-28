import { authRequest } from './apiClient';
import type { Setlist, SetlistSong, PaginatedResponse, ApiResponse } from '@/types';

interface SetlistQuery {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  eventType?: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
}

interface CreateSetlistPayload {
  title: string;
  date: string;
  eventType: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
  notes?: string;
}

interface AddSongPayload {
  songId: string;
  position: number;
  customKey?: string;
  capo?: number;
  notes?: string;
}

function buildQuery(params: Record<string, unknown>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

export type SetlistWithSongs = Setlist & { songs: SetlistSong[] };

export const setlistsApi = {
  list: (query: SetlistQuery = {}) =>
    authRequest<ApiResponse<PaginatedResponse<Setlist>>>(
      `/setlists${buildQuery(query as Record<string, unknown>)}`,
    ),

  findById: (id: string) => authRequest<ApiResponse<SetlistWithSongs>>(`/setlists/${id}`),

  create: (payload: CreateSetlistPayload) =>
    authRequest<ApiResponse<Setlist>>('/setlists', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<CreateSetlistPayload> & { status?: string }) =>
    authRequest<ApiResponse<Setlist>>(`/setlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) => authRequest<void>(`/setlists/${id}`, { method: 'DELETE' }),

  publish: (id: string) =>
    authRequest<ApiResponse<Setlist>>(`/setlists/${id}/publish`, { method: 'PUT' }),

  duplicate: (id: string) =>
    authRequest<ApiResponse<Setlist>>(`/setlists/${id}/duplicate`, { method: 'POST' }),

  addSong: (id: string, payload: AddSongPayload) =>
    authRequest<ApiResponse<SetlistSong>>(`/setlists/${id}/songs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSong: (id: string, songId: string, payload: Partial<AddSongPayload>) =>
    authRequest<ApiResponse<SetlistSong>>(`/setlists/${id}/songs/${songId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  removeSong: (id: string, songId: string) =>
    authRequest<void>(`/setlists/${id}/songs/${songId}`, { method: 'DELETE' }),

  reorder: (id: string, songs: { id: string; position: number }[]) =>
    authRequest<ApiResponse<SetlistWithSongs>>(`/setlists/${id}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ songs }),
    }),
};
