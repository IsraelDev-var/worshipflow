'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSetlistStore } from '@/store/setlistStore';
import { useSongStore } from '@/store/songStore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Song, SetlistSong } from '@/types';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};
const EVENT_TYPE_LABELS: Record<string, string> = {
  SERVICE: 'Servicio',
  REHEARSAL: 'Ensayo',
  SPECIAL: 'Especial',
};

function AddSongModal({
  isOpen,
  onClose,
  onAdd,
  songs,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (songId: string, customKey?: string, capo?: number) => Promise<void>;
  songs: Song[];
}) {
  const [selectedSong, setSelectedSong] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [capo, setCapo] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.author ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!selectedSong) return;
    setIsAdding(true);
    try {
      await onAdd(selectedSong, customKey || undefined, capo || undefined);
      setSelectedSong('');
      setCustomKey('');
      setCapo(0);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir canción" size="md">
      <div className="space-y-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar canción..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin resultados</p>
          ) : (
            filtered.map((song) => (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song.id)}
                className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                  selectedSong === song.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                    {song.author && <p className="text-xs text-gray-500">{song.author}</p>}
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    {song.originalKey}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedSong && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tonalidad personalizada
              </label>
              <input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Ej: Am"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cejilla</label>
              <input
                type="number"
                min={0}
                max={12}
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} isLoading={isAdding} disabled={!selectedSong}>
            Añadir
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

export default function SetlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentSetlist,
    isLoading,
    fetchSetlist,
    publishSetlist,
    deleteSetlist,
    addSong,
    removeSong,
    reorderSongs,
  } = useSetlistStore();
  const { songs, fetchSongs } = useSongStore();

  const [showAddSong, setShowAddSong] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  const draggedId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'LEADER';

  useEffect(() => {
    if (id) {
      fetchSetlist(id);
      fetchSongs({ limit: 100 });
    }
  }, [id]);

  const handleAddSong = async (songId: string, customKey?: string, capo?: number) => {
    const position = currentSetlist?.songs.length ?? 0;
    await addSong(id as string, { songId, position, customKey, capo });
  };

  const handlePublish = async () => {
    await publishSetlist(id as string);
  };

  const handleDelete = async () => {
    await deleteSetlist(id as string);
    router.push('/setlists');
  };

  const handleDragStart = (entryId: string) => (e: React.DragEvent) => {
    draggedId.current = entryId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (entryId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId.current !== entryId) setDragOverId(entryId);
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId.current || draggedId.current === targetId) return;

    const current = [...orderedSongs];
    const fromIdx = current.findIndex((s) => s.id === draggedId.current);
    const toIdx = current.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...current];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    reorderSongs(
      id as string,
      reordered.map((s) => s.id),
    );
    draggedId.current = null;
  };

  const handleDragEnd = () => {
    draggedId.current = null;
    setDragOverId(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (isLoading || !currentSetlist) return <PageSpinner />;

  const orderedSongs = [...(currentSetlist.songs ?? [])].sort(
    (a: SetlistSong, b: SetlistSong) => a.position - b.position,
  );

  if (liveMode) {
    return (
      <div className="fixed inset-0 bg-gray-950 text-white z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">{currentSetlist.title}</h1>
          <button
            onClick={() => setLiveMode(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Salir
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orderedSongs.map((entry, idx) => (
            <div key={entry.id} className="border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-gray-500 text-sm font-mono mr-3">{idx + 1}.</span>
                  <span className="text-2xl font-bold">{entry.song?.title}</span>
                  {entry.song?.author && (
                    <p className="text-gray-400 text-sm mt-1">{entry.song.author}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {(entry.customKey || entry.song?.originalKey) && (
                    <span className="text-lg font-bold text-blue-400 bg-blue-950 px-3 py-1 rounded-lg">
                      {entry.customKey ?? entry.song?.originalKey}
                    </span>
                  )}
                  {entry.capo > 0 && (
                    <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      Cejilla {entry.capo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          Setlists
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setLiveMode(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Vista Live
          </Button>
          {canEdit && currentSetlist.status === 'DRAFT' && (
            <Button size="sm" onClick={handlePublish}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Publicar
            </Button>
          )}
          {canEdit && (
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
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{currentSetlist.title}</h1>
          <Badge variant={STATUS_VARIANT[currentSetlist.status] ?? 'default'}>
            {STATUS_LABELS[currentSetlist.status]}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          {EVENT_TYPE_LABELS[currentSetlist.eventType]} · {formatDate(currentSetlist.date)}
        </p>
        {currentSetlist.notes && (
          <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">
            {currentSetlist.notes}
          </p>
        )}
      </div>

      {/* Songs */}
      <Card padding="none">
        <CardHeader
          title={`Canciones (${orderedSongs.length})`}
          action={
            canEdit ? (
              <Button size="sm" onClick={() => setShowAddSong(true)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Añadir
              </Button>
            ) : undefined
          }
        />

        {orderedSongs.length === 0 ? (
          <EmptyState
            title="Sin canciones"
            description="Añade canciones desde tu repertorio."
            action={
              canEdit ? (
                <Button size="sm" onClick={() => setShowAddSong(true)}>
                  Añadir primera canción
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {orderedSongs.map((entry: SetlistSong, idx: number) => (
              <div
                key={entry.id}
                draggable={canEdit}
                onDragStart={canEdit ? handleDragStart(entry.id) : undefined}
                onDragOver={canEdit ? handleDragOver(entry.id) : undefined}
                onDrop={canEdit ? handleDrop(entry.id) : undefined}
                onDragEnd={canEdit ? handleDragEnd : undefined}
                className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                  dragOverId === entry.id ? 'bg-blue-50 border-t-2 border-blue-400' : ''
                } ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {canEdit && (
                  <svg
                    className="w-4 h-4 text-gray-300 shrink-0 cursor-grab"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
                <span className="text-sm font-bold text-gray-400 w-5 text-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/songs/${entry.songId}`)}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left truncate block"
                  >
                    {entry.song?.title ?? 'Canción'}
                  </button>
                  {entry.song?.author && (
                    <p className="text-xs text-gray-500">{entry.song.author}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.customKey ? (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {entry.customKey}
                    </span>
                  ) : entry.song?.originalKey ? (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {entry.song.originalKey}
                    </span>
                  ) : null}
                  {entry.capo > 0 && (
                    <span className="text-xs text-gray-400">Cejilla {entry.capo}</span>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => removeSong(id as string, entry.id)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
                      title="Eliminar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {canEdit && (
        <AddSongModal
          isOpen={showAddSong}
          onClose={() => setShowAddSong(false)}
          onAdd={handleAddSong}
          songs={songs}
        />
      )}

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar setlist"
      >
        <p className="text-sm text-gray-600">
          ¿Seguro que quieres eliminar <strong>{currentSetlist.title}</strong>?
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
