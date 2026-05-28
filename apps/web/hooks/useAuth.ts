/**
 * Hook para usar autenticación en componentes
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

export function useAuth() {
  const auth = useAuthStore();

  /**
   * Cargar usuario al montar el componente
   */
  useEffect(() => {
    const loadUser = async () => {
      if (auth.accessToken && !auth.user) {
        try {
          const response = (await authApi.getMe(auth.accessToken)) as {
            data: import('@/types').User;
          };
          auth.setUser(response.data);
        } catch (error) {
          // Token inválido o expirado
          auth.logout();
        }
      }
    };

    loadUser();
  }, []);

  return auth;
}
