import { authRequest } from './apiClient';
import type { Event, EventMember, PaginatedResponse, ApiResponse } from '@/types';

interface EventQuery {
  page?: number;
  limit?: number;
  type?: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
  upcoming?: boolean;
}

interface CreateEventPayload {
  title: string;
  type: 'SERVICE' | 'REHEARSAL' | 'SPECIAL';
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  setlistId?: string;
}

interface AssignMemberPayload {
  userId: string;
  instrumentId: string;
  notes?: string;
}

function buildQuery(params: Record<string, unknown>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

export type EventWithMembers = Event & { members: EventMember[] };

export const eventsApi = {
  list: (query: EventQuery = {}) =>
    authRequest<ApiResponse<PaginatedResponse<Event>>>(
      `/events${buildQuery(query as Record<string, unknown>)}`,
    ),

  findById: (id: string) => authRequest<ApiResponse<EventWithMembers>>(`/events/${id}`),

  create: (payload: CreateEventPayload) =>
    authRequest<ApiResponse<Event>>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<CreateEventPayload>) =>
    authRequest<ApiResponse<Event>>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) => authRequest<void>(`/events/${id}`, { method: 'DELETE' }),

  assignMember: (id: string, payload: AssignMemberPayload) =>
    authRequest<ApiResponse<EventMember>>(`/events/${id}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMember: (id: string, memberId: string, payload: Partial<AssignMemberPayload>) =>
    authRequest<ApiResponse<EventMember>>(`/events/${id}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  removeMember: (id: string, memberId: string) =>
    authRequest<void>(`/events/${id}/members/${memberId}`, { method: 'DELETE' }),

  respond: (id: string, memberId: string, status: 'CONFIRMED' | 'DECLINED') =>
    authRequest<ApiResponse<EventMember>>(`/events/${id}/members/${memberId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
