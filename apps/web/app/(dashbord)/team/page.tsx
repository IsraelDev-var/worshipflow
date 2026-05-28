'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/services/users.api';
import { authRequest } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MUSICIAN: 'Músico',
  GUEST: 'Invitado',
};

const ROLE_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ADMIN: 'danger',
  LEADER: 'info',
  MUSICIAN: 'success',
  GUEST: 'default',
};

export default function TeamPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<User[]>([]);
  const [orgSlug, setOrgSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([
      usersApi.list(),
      authRequest<{ success: boolean; data: { slug: string } }>('/organizations/current'),
    ])
      .then(([usersRes, orgRes]) => {
        const payload = usersRes.data as any;
        setMembers(payload?.data ?? []);
        setOrgSlug((orgRes as any).data?.slug ?? '');
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(orgSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    setIsDeactivating(true);
    try {
      await usersApi.deactivate(confirmDeactivate.id);
      setMembers((prev) => prev.filter((m) => m.id !== confirmDeactivate.id));
      setConfirmDeactivate(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {members.length} miembros en la organización
          </p>
        </div>
        {orgSlug && (
          <Card padding="sm">
            <p className="text-xs text-gray-500 mb-1">Código para unirse</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                {orgSlug}
              </code>
              <button
                onClick={copyCode}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </Card>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          title="No hay miembros aún"
          description="Los usuarios que se registren en la organización aparecerán aquí."
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                    {member.firstName[0]?.toUpperCase()}
                    {member.lastName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                      {member.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-gray-400">(tú)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ROLE_VARIANTS[member.role] ?? 'default'}>
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                  {isAdmin && member.id !== currentUser?.id && (
                    <button
                      onClick={() => setConfirmDeactivate(member)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Desactivar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        title="Desactivar miembro"
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que quieres desactivar a{' '}
          <strong>
            {confirmDeactivate?.firstName} {confirmDeactivate?.lastName}
          </strong>
          ? No podrá acceder a la aplicación.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={isDeactivating} onClick={handleDeactivate}>
            Desactivar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
