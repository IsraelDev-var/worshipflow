'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/store/eventStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';

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

function EventFormModal({
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
    type: 'SERVICE' as const,
    date: today,
    startTime: '09:00',
    endTime: '',
    location: '',
  });

  const reset = () =>
    setForm({
      title: '',
      type: 'SERVICE',
      date: today,
      startTime: '09:00',
      endTime: '',
      location: '',
    });
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: form.title,
      type: form.type,
      date: form.date,
      startTime: `${form.date}T${form.startTime}:00.000Z`,
      endTime: form.endTime ? `${form.date}T${form.endTime}:00.000Z` : undefined,
      location: form.location || undefined,
    });
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo evento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Ensayo de alabanza"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Santuario principal"
          />
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Crear evento
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { events, isLoading, total, fetchEvents, createEvent } = useEventStore();
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [upcoming, setUpcoming] = useState(true);

  useEffect(() => {
    fetchEvents({
      type: (filterType as any) || undefined,
      upcoming: upcoming || undefined,
    });
  }, [filterType, upcoming]);

  const handleCreate = async (data: any) => {
    setIsCreating(true);
    try {
      const ev = await createEvent(data);
      setShowModal(false);
      router.push(`/events/${ev.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} eventos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo evento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setUpcoming(!upcoming)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            upcoming ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Próximos
        </button>
        {['', 'SERVICE', 'REHEARSAL', 'SPECIAL'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === '' ? 'Todos' : TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : events.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          title="No hay eventos"
          description="Crea tu primer evento para coordinar servicios y ensayos."
          action={<Button onClick={() => setShowModal(true)}>Crear primer evento</Button>}
        />
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => router.push(`/events/${ev.id}`)}
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
                      {new Date(ev.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      {new Date(ev.date).toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{ev.title}</h3>
                      <Badge variant={TYPE_VARIANT[ev.type] ?? 'default'}>
                        {TYPE_LABELS[ev.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(ev.date)}
                      {ev.startTime && ` · ${formatTime(ev.startTime)}`}
                      {ev.location && ` · ${ev.location}`}
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

      <EventFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </div>
  );
}
