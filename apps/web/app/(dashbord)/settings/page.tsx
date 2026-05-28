'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authRequest } from '@/services/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface OrgData {
  id: string;
  name: string;
  slug: string;
  timezone?: string;
  logoUrl?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', timezone: '' });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
    authRequest<{ success: boolean; data: OrgData }>('/organizations/current')
      .then((res) => {
        const data = (res as any).data;
        setOrg(data);
        setForm({ name: data.name ?? '', timezone: data.timezone ?? '' });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAdmin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSaving(true);
    try {
      const res = await authRequest<{ success: boolean; data: OrgData }>('/organizations/current', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setOrg((res as any).data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return null;
  if (isLoading) return <div className="text-sm text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Administra la configuración de tu organización
        </p>
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Organización</h2>

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-2 rounded mb-4">
            Cambios guardados correctamente
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la iglesia"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Zona horaria"
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            placeholder="America/Mexico_City"
            helperText="Ej: America/Bogota, America/Lima, America/Mexico_City"
          />
          <Button type="submit" isLoading={isSaving}>
            Guardar cambios
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Información de la organización</h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Slug / Código de unión</dt>
            <dd className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
              {org?.slug}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">ID de organización</dt>
            <dd className="text-gray-400 font-mono text-xs">{org?.id}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
