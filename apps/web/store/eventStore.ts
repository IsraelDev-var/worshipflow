import { create } from 'zustand';
import { eventsApi } from '@/services/events.api';
import type { Event } from '@/types';
import type { EventWithMembers } from '@/services/events.api';

interface EventQuery {
  page?: number;
  limit?: number;
  type?: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
  upcoming?: boolean;
}

interface EventState {
  events: Event[];
  currentEvent: EventWithMembers | null;
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  fetchEvents: (query?: EventQuery) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data: Parameters<typeof eventsApi.create>[0]) => Promise<Event>;
  updateEvent: (id: string, data: Parameters<typeof eventsApi.update>[1]) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  removeMember: (eventId: string, memberId: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  total: 0,
  page: 1,
  pages: 1,
  isLoading: false,
  error: null,

  fetchEvents: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await eventsApi.list(query);
      const payload = res.data as any;
      set({
        events: payload?.data ?? [],
        total: payload?.meta?.total ?? 0,
        page: payload?.meta?.page ?? 1,
        pages: payload?.meta?.pages ?? 1,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  fetchEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await eventsApi.findById(id);
      set({ currentEvent: res.data ?? null, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  },

  createEvent: async (data) => {
    const res = await eventsApi.create(data);
    const ev = res.data!;
    set((s) => ({ events: [ev, ...s.events] }));
    return ev;
  },

  updateEvent: async (id, data) => {
    const res = await eventsApi.update(id, data);
    const updated = res.data!;
    set((s) => ({
      events: s.events.map((ev) => (ev.id === id ? updated : ev)),
      currentEvent: s.currentEvent?.id === id ? { ...s.currentEvent, ...updated } : s.currentEvent,
    }));
  },

  deleteEvent: async (id) => {
    await eventsApi.delete(id);
    set((s) => ({
      events: s.events.filter((ev) => ev.id !== id),
      currentEvent: s.currentEvent?.id === id ? null : s.currentEvent,
    }));
  },

  removeMember: async (eventId, memberId) => {
    await eventsApi.removeMember(eventId, memberId);
    await get().fetchEvent(eventId);
  },

  clearCurrent: () => set({ currentEvent: null }),
}));
