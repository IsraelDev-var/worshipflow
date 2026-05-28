'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetlistStore } from '@/store/setlistStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';

const EVENT_TYPE_LABELS: Record<string, string> = {
  SERVICE: 'Servicio',
  REHEARSAL: 'Ensayo',
  SPECIAL: 'Especial',
};

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

function SetlistFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    date: today,
    eventType: 'SERVICE' as const,
    notes: '',
  });

  const reset = () => setForm({ title: '', date: today, eventType: 'SERVICE', notes: '' });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo setlist" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Servicio dominical 1 de junio"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              value={form.eventType}
              onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales..."
          />
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Crear setlist
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function SetlistsPage() {
  const router = useRouter();
  const { setlists, isLoading, total, fetchSetlists, createSetlist } = useSetlistStore();
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchSetlists({ status: (filterStatus as any) || undefined });
  }, [filterStatus]);

  const handleCreate = async (data: any) => {
    setIsCreating(true);
    try {
      const sl = await createSetlist(data);
      setShowModal(false);
      router.push(`/setlists/${sl.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setlists</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} setlists en total</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo setlist
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          ['', 'Todos'],
          ['DRAFT', 'Borradores'],
          ['PUBLISHED', 'Publicados'],
          ['ARCHIVED', 'Archivados'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === val
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : setlists.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title="No hay setlists aún"
          description="Crea tu primer setlist para organizar las canciones de un servicio."
          action={<Button onClick={() => setShowModal(true)}>Crear primer setlist</Button>}
        />
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <button
              key={sl.id}
              onClick={() => router.push(`/setlists/${sl.id}`)}
              className="w-full text-left"
            >
              <Card
                padding="sm"
                className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Date block */}
                  <div className="shrink-0 w-12 text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {new Date(sl.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      {new Date(sl.date).toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{sl.title}</h3>
                      <Badge variant={STATUS_VARIANT[sl.status] ?? 'default'}>
                        {STATUS_LABELS[sl.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {EVENT_TYPE_LABELS[sl.eventType]} · {formatDate(sl.date)}
                    </p>
                  </div>

                  <svg
                    className="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <SetlistFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </div>
  );
}
