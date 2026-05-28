'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎵 WorshipFlow</h1>
        <p className="text-gray-600 mb-8">Gestiona la música de tu banda de alabanza</p>

        {auth.isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-700">¡Bienvenido, {auth.user?.firstName}!</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Ir al Dashboard
            </Button>
            <Button variant="secondary" onClick={() => auth.logout()} className="w-full">
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Iniciar Sesión
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/auth/register')}
              className="w-full"
            >
              Registrarse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
