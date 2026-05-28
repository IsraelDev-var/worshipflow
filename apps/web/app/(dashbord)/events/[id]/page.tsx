'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore } from '@/store/eventStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { eventsApi } from '@/services/events.api';
import type { EventMember } from '@/types';

const TYPE_VARIANT: Record<string, 'info' | 'success' | 'warning'> = {
  SERVICE: 'info',
  REHEARSAL: 'success',
  SPECIAL: 'warning',
};
const TYPE_LABELS: Record<string, string> = {
  SERVICE: 'Servicio',
  REHEARSAL: 'Ensayo',
  SPECIAL: 'Especial',
};
const STATUS_VARIANT: Record<string, 'default' | 'success' | 'danger'> = {
  PENDING: 'default',
  CONFIRMED: 'success',
  DECLINED: 'danger',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  DECLINED: 'Rechazado',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentEvent, isLoading, fetchEvent, deleteEvent, removeMember } = useEventStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  const handleDelete = async () => {
    await deleteEvent(id as string);
    router.push('/events');
  };

  const handleRemoveMember = async (memberId: string) => {
    setDeletingMemberId(memberId);
    try {
      await removeMember(id as string, memberId);
    } finally {
      setDeletingMemberId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  if (isLoading || !currentEvent) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Eventos
        </button>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{currentEvent.title}</h1>
          <Badge variant={TYPE_VARIANT[currentEvent.type] ?? 'default'}>
            {TYPE_LABELS[currentEvent.type]}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1 capitalize">{formatDate(currentEvent.date)}</p>
      </div>

      {/* Info card */}
      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Inicio</p>
            <p className="text-sm font-medium text-gray-900">
              {currentEvent.startTime ? formatTime(currentEvent.startTime) : '—'}
            </p>
          </div>
          {currentEvent.endTime && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Fin</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTime(currentEvent.endTime)}
              </p>
            </div>
          )}
          {currentEvent.location && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Lugar</p>
              <p className="text-sm font-medium text-gray-900">{currentEvent.location}</p>
            </div>
          )}
          {currentEvent.setlistId && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Setlist</p>
              <button
                onClick={() => router.push(`/setlists/${currentEvent.setlistId}`)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Ver setlist vinculado →
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Members */}
      <Card padding="none">
        <CardHeader
          title={`Equipo (${currentEvent.members?.length ?? 0})`}
          description="Músicos asignados a este evento"
        />

        {!currentEvent.members || currentEvent.members.length === 0 ? (
          <EmptyState
            title="Sin músicos asignados"
            description="Asigna músicos desde el perfil de cada usuario."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {currentEvent.members.map((member: EventMember) => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {member.user?.firstName?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.user?.firstName} {member.user?.lastName}
                  </p>
                  {member.instrument && (
                    <p className="text-xs text-gray-500">{member.instrument.name}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={STATUS_VARIANT[member.status] ?? 'default'}>
                    {STATUS_LABELS[member.status]}
                  </Badge>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={deletingMemberId === member.id}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded disabled:opacity-50"
                    title="Remover"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete confirm */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar evento"
      >
        <p className="text-sm text-gray-600">
          ¿Seguro que quieres eliminar <strong>{currentEvent.title}</strong>? Esta acción no se
          puede deshacer.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
