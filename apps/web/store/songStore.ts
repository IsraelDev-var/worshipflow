import { create } from 'zustand';
import { songsApi } from '@/services/songs.api';
import type { Song, Category } from '@/types';

interface SongQuery {
  page?: number;
  limit?: number;
  search?: string;
  key?: string;
  categoryId?: string;
  sortBy?: 'title' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

interface SongState {
  songs: Song[];
  currentSong: Song | null;
  categories: Category[];
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  fetchSongs: (query?: SongQuery) => Promise<void>;
  fetchSong: (id: string) => Promise<void>;
  createSong: (data: Parameters<typeof songsApi.create>[0]) => Promise<Song>;
  updateSong: (id: string, data: Parameters<typeof songsApi.update>[1]) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useSongStore = create<SongState>((set) => ({
  songs: [],
  currentSong: null,
  categories: [],
  total: 0,
  page: 1,
  pages: 1,
  isLoading: false,
  error: null,

  fetchSongs: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await songsApi.list(query);
      const payload = res.data as any;
      set({
        songs: payload?.data ?? [],
        total: payload?.meta?.total ?? 0,
        page: payload?.meta?.page ?? 1,
        pages: payload?.meta?.pages ?? 1,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  fetchSong: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await songsApi.findById(id);
      set({ currentSong: res.data ?? null, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  createSong: async (data) => {
    const res = await songsApi.create(data);
    const song = res.data!;
    set((s) => ({ songs: [song, ...s.songs] }));
    return song;
  },

  updateSong: async (id, data) => {
    const res = await songsApi.update(id, data);
    const updated = res.data!;
    set((s) => ({
      songs: s.songs.map((sg) => (sg.id === id ? updated : sg)),
      currentSong: s.currentSong?.id === id ? updated : s.currentSong,
    }));
  },

  deleteSong: async (id) => {
    await songsApi.delete(id);
    set((s) => ({
      songs: s.songs.filter((sg) => sg.id !== id),
      currentSong: s.currentSong?.id === id ? null : s.currentSong,
    }));
  },

  clearCurrent: () => set({ currentSong: null }),
}));
