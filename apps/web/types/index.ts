/**
 * Tipos compartidos entre frontend y backend
 */

// ============================================
// Auth Types
// ============================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  LEADER = 'LEADER',
  MUSICIAN = 'MUSICIAN',
  GUEST = 'GUEST',
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'passwordHash'>;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Category Types
// ============================================
export interface Category {
  id: string;
  name: string;
  color: string;
  organizationId: string;
}

// ============================================
// Song Types
// ============================================
export interface Song {
  id: string;
  title: string;
  author?: string;
  originalKey: string;
  tempo?: number;
  timeSignature: string;
  durationSeconds?: number;
  content: string; // ChordPro format
  lastUsedAt?: string;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  sections?: SongSection[];
}

export interface SongSection {
  id: string;
  type: SectionType;
  order: number;
  content: string;
  label?: string;
}

export enum SectionType {
  INTRO = 'INTRO',
  VERSE = 'VERSE',
  CHORUS = 'CHORUS',
  BRIDGE = 'BRIDGE',
  OUTRO = 'OUTRO',
  PRECHORUS = 'PRECHORUS',
  INTERLUDE = 'INTERLUDE',
}

// ============================================
// Setlist Types
// ============================================
export interface Setlist {
  id: string;
  title: string;
  date: string;
  eventType: EventType;
  notes?: string;
  status: SetlistStatus;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetlistSong {
  id: string;
  setlistId: string;
  songId: string;
  position: number;
  customKey?: string;
  capo: number;
  notes?: string;
  song?: Song;
}

export enum SetlistStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ============================================
// Event Types
// ============================================
export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  organizationId: string;
  createdById: string;
  setlistId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EventType {
  SERVICE = 'SERVICE',
  REHEARSAL = 'REHEARSAL',
  SPECIAL = 'SPECIAL',
}

export interface EventMember {
  id: string;
  eventId: string;
  userId: string;
  instrumentId: string;
  status: AssignmentStatus;
  notes?: string;
  user?: User;
  instrument?: Instrument;
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

// ============================================
// Instrument Types
// ============================================
export interface Instrument {
  id: string;
  name: string;
  icon?: string;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ============================================
// Form Types
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationId: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
