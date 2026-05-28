'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authRequest } from '@/services/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { User } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MUSICIAN: 'Músico',
  GUEST: 'Invitado',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);
    try {
      const res = await authRequest<{ success: boolean; data: User }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setUser((res as any).data);
      setSuccess(true);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
    setEditing(false);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona tu información personal</p>
      </div>

      {/* Avatar + name card */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 shrink-0">
            {user?.firstName?.[0]?.toUpperCase()}
            {user?.lastName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-2 rounded mb-4">
            Perfil actualizado correctamente
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" isLoading={isLoading}>
                Guardar
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Editar nombre
          </Button>
        )}
      </Card>

      {/* Account info */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Información de cuenta</h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{user?.email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Rol</dt>
            <dd className="text-gray-900">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Email verificado</dt>
            <dd className={user?.emailVerified ? 'text-green-600' : 'text-amber-600'}>
              {user?.emailVerified ? 'Sí' : 'Pendiente de verificación'}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Miembro desde</dt>
            <dd className="text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
