import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';
import { authApi } from '@/services/api';
import type { AuthResponse } from '@/types';

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  organizationSlug?: string;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = (await authApi.login({ email, password })) as AuthResponse;
          if (!response.data) throw new Error(response.message || 'Error al iniciar sesión');
          set({
            user: response.data.user as User,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(payload);
          set({ isLoading: false, error: null });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Error al registrarse';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: () => {
        const token = get().accessToken;
        if (token) authApi.logout(token).catch(() => {});
        set(initialState);
      },

      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'worshipflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
