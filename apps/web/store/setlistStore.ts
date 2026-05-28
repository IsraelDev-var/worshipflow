import { create } from 'zustand';
import { setlistsApi } from '@/services/setlists.api';
import type { Setlist, SetlistSong } from '@/types';
import type { SetlistWithSongs } from '@/services/setlists.api';

interface SetlistQuery {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  eventType?: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
}

interface SetlistState {
  setlists: Setlist[];
  currentSetlist: SetlistWithSongs | null;
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  fetchSetlists: (query?: SetlistQuery) => Promise<void>;
  fetchSetlist: (id: string) => Promise<void>;
  createSetlist: (data: Parameters<typeof setlistsApi.create>[0]) => Promise<Setlist>;
  updateSetlist: (id: string, data: Parameters<typeof setlistsApi.update>[1]) => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  publishSetlist: (id: string) => Promise<void>;
  duplicateSetlist: (id: string) => Promise<Setlist>;
  addSong: (setlistId: string, data: Parameters<typeof setlistsApi.addSong>[1]) => Promise<void>;
  removeSong: (setlistId: string, entryId: string) => Promise<void>;
  reorderSongs: (setlistId: string, orderedIds: string[]) => Promise<void>;
  clearCurrent: () => void;
}

export const useSetlistStore = create<SetlistState>((set, get) => ({
  setlists: [],
  currentSetlist: null,
  total: 0,
  page: 1,
  pages: 1,
  isLoading: false,
  error: null,

  fetchSetlists: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await setlistsApi.list(query);
      const payload = res.data as any;
      set({
        setlists: payload?.data ?? [],
        total: payload?.meta?.total ?? 0,
        page: payload?.meta?.page ?? 1,
        pages: payload?.meta?.pages ?? 1,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  fetchSetlist: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await setlistsApi.findById(id);
      set({ currentSetlist: res.data ?? null, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  createSetlist: async (data) => {
    const res = await setlistsApi.create(data);
    const sl = res.data!;
    set((s) => ({ setlists: [sl, ...s.setlists] }));
    return sl;
  },

  updateSetlist: async (id, data) => {
    const res = await setlistsApi.update(id, data);
    const updated = res.data!;
    set((s) => ({
      setlists: s.setlists.map((sl) => (sl.id === id ? updated : sl)),
      currentSetlist:
        s.currentSetlist?.id === id ? { ...s.currentSetlist, ...updated } : s.currentSetlist,
    }));
  },

  deleteSetlist: async (id) => {
    await setlistsApi.delete(id);
    set((s) => ({
      setlists: s.setlists.filter((sl) => sl.id !== id),
      currentSetlist: s.currentSetlist?.id === id ? null : s.currentSetlist,
    }));
  },

  publishSetlist: async (id) => {
    const res = await setlistsApi.publish(id);
    const updated = res.data!;
    set((s) => ({
      setlists: s.setlists.map((sl) => (sl.id === id ? updated : sl)),
      currentSetlist:
        s.currentSetlist?.id === id ? { ...s.currentSetlist, ...updated } : s.currentSetlist,
    }));
  },

  duplicateSetlist: async (id) => {
    const res = await setlistsApi.duplicate(id);
    const dup = res.data!;
    set((s) => ({ setlists: [dup, ...s.setlists] }));
    return dup;
  },

  addSong: async (setlistId, data) => {
    await setlistsApi.addSong(setlistId, data);
    // Refetch so positions are accurate
    await get().fetchSetlist(setlistId);
  },

  removeSong: async (setlistId, entryId) => {
    await setlistsApi.removeSong(setlistId, entryId);
    set((s) => ({
      currentSetlist: s.currentSetlist
        ? {
            ...s.currentSetlist,
            songs: s.currentSetlist.songs.filter((ss: SetlistSong) => ss.id !== entryId),
          }
        : null,
    }));
  },

  reorderSongs: async (setlistId, orderedIds) => {
    const songs = orderedIds.map((id, position) => ({ id, position }));
    set((s) => {
      if (!s.currentSetlist) return s;
      const songMap = new Map(s.currentSetlist.songs.map((ss: SetlistSong) => [ss.id, ss]));
      const reordered = orderedIds
        .map((id, i) => ({ ...songMap.get(id)!, position: i }))
        .filter(Boolean) as SetlistSong[];
      return { currentSetlist: { ...s.currentSetlist, songs: reordered } };
    });
    await setlistsApi.reorder(setlistId, songs);
  },

  clearCurrent: () => set({ currentSetlist: null }),
}));
