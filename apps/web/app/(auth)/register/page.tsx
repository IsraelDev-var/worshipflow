'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationSlug: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(mode === 'create'
          ? { organizationName: formData.organizationName }
          : { organizationSlug: formData.organizationSlug }),
      });
      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">WorshipFlow</h1>
      <p className="text-gray-600 text-center mb-6">Crea tu cuenta</p>

      {/* Toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nueva iglesia
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'join'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Unirse a iglesia
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            name="firstName"
            label="Nombre"
            placeholder="Juan"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="lastName"
            label="Apellido"
            placeholder="Pérez"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {mode === 'create' ? (
          <Input
            type="text"
            name="organizationName"
            label="Nombre de la iglesia"
            placeholder="Mi Iglesia"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
        ) : (
          <Input
            type="text"
            name="organizationSlug"
            label="Código de la iglesia"
            placeholder="mi-iglesia-1234567890"
            helperText="El administrador de tu iglesia tiene este código en la sección Equipo."
            value={formData.organizationSlug}
            onChange={handleChange}
            required
          />
        )}

        <Input
          type="password"
          name="password"
          label="Contraseña"
          placeholder="Mín 8 caracteres"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          {mode === 'create' ? 'Crear cuenta y registrar iglesia' : 'Unirme a la iglesia'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
