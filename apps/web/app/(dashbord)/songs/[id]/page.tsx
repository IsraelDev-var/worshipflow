'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSongStore } from '@/store/songStore';
import { ChordProViewer } from '@/components/songs/ChordProViewer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { KEYS, transposeChordPro, getSemitones, getCapoSuggestions } from '@/utils/transpose';
import { categoriesApi } from '@/services/categories.api';
import type { Category } from '@/types';

function EditSongModal({
  isOpen,
  onClose,
  onSubmit,
  song,
  categories,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  song: any;
  categories: Category[];
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    title: song.title ?? '',
    author: song.author ?? '',
    originalKey: song.originalKey ?? 'C',
    tempo: song.tempo?.toString() ?? '',
    timeSignature: song.timeSignature ?? '4/4',
    content: song.content ?? '',
    categoryIds: (song.categories ?? []).map((c: Category) => c.id),
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      title: song.title ?? '',
      author: song.author ?? '',
      originalKey: song.originalKey ?? 'C',
      tempo: song.tempo?.toString() ?? '',
      timeSignature: song.timeSignature ?? '4/4',
      content: song.content ?? '',
      categoryIds: (song.categories ?? []).map((c: Category) => c.id),
    });
  }, [song]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        title: form.title,
        author: form.author || undefined,
        originalKey: form.originalKey,
        tempo: form.tempo ? Number(form.tempo) : undefined,
        timeSignature: form.timeSignature,
        content: form.content,
        categoryIds: form.categoryIds,
      });
    } catch {
      setError('Error al guardar los cambios. Intenta de nuevo.');
    }
  };

  const toggleCategory = (id: string) =>
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c: string) => c !== id)
        : [...f.categoryIds, id],
    }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar canción" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tonalidad *</label>
            <select
              value={form.originalKey}
              onChange={(e) => setForm((f) => ({ ...f, originalKey: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (BPM)</label>
            <input
              type="number"
              min={20}
              max={300}
              value={form.tempo}
              onChange={(e) => setForm((f) => ({ ...f, tempo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compás</label>
            <select
              value={form.timeSignature}
              onChange={(e) => setForm((f) => ({ ...f, timeSignature: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['4/4', '3/4', '6/8', '2/4', '12/8'].map((ts) => (
                <option key={ts} value={ts}>
                  {ts}
                </option>
              ))}
            </select>
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.categoryIds.includes(cat.id)
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                  style={
                    form.categoryIds.includes(cat.id)
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : {}
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letra y acordes (ChordPro) *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={12}
              placeholder={'[C]Santo, [G]santo, [Am]santo\n[F]Es el Señor'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div
              className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 overflow-y-auto"
              style={{ minHeight: '12rem', maxHeight: '18rem' }}
            >
              {form.content.trim() ? (
                <ChordProViewer content={form.content} />
              ) : (
                <p className="text-xs text-gray-400 italic">Preview aparecerá aquí...</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Usa <code className="bg-gray-100 px-1 rounded">[C]</code> antes de la sílaba para
            indicar acordes.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentSong, isLoading, fetchSong, updateSong, deleteSong } = useSongStore();

  const [displayKey, setDisplayKey] = useState('');
  const [semitones, setSemitones] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSong(id);
      categoriesApi
        .list()
        .then((r) => setCategories(r.data ?? []))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (currentSong) {
      setDisplayKey(currentSong.originalKey);
      setSemitones(0);
    }
  }, [currentSong]);

  const handleKeyChange = (targetKey: string) => {
    if (!currentSong) return;
    const steps = getSemitones(currentSong.originalKey, targetKey);
    setSemitones(steps);
    setDisplayKey(targetKey);
  };

  const shiftSemitones = (delta: number) => {
    if (!currentSong) return;
    const newSemitones = (semitones + delta + 12) % 12;
    setSemitones(newSemitones);
    setDisplayKey(
      KEYS[
        newSemitones === 0
          ? KEYS.indexOf(currentSong.originalKey)
          : (KEYS.indexOf(currentSong.originalKey) + newSemitones) % 12
      ],
    );
  };

  const handleUpdate = async (data: any) => {
    setIsUpdating(true);
    try {
      await updateSong(id as string, data);
      setShowEdit(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    await deleteSong(id as string);
    router.push('/songs');
  };

  if (isLoading || !currentSong) {
    return <PageSpinner />;
  }

  const transposedContent =
    semitones !== 0 ? transposeChordPro(currentSong.content, semitones) : currentSong.content;

  return (
    <div className="space-y-6 max-w-4xl">
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
          Canciones
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </Button>
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
      </div>

      {/* Song header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{currentSong.title}</h1>
        {currentSong.author && <p className="text-gray-500 mt-1 text-sm">{currentSong.author}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {currentSong.tempo && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {currentSong.tempo} bpm
            </span>
          )}
          <span className="text-sm text-gray-500">{currentSong.timeSignature}</span>
          {currentSong.categories?.map((cat: Category) => (
            <span
              key={cat.id}
              className="text-xs px-2 py-1 rounded-full font-medium text-white"
              style={{ backgroundColor: cat.color }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Transposition control */}
      <Card padding="sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Tonalidad:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftSemitones(-1)}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
            >
              −
            </button>
            <select
              value={displayKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <button
              onClick={() => shiftSemitones(1)}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
            >
              +
            </button>
          </div>
          {semitones !== 0 && (
            <button
              onClick={() => {
                setSemitones(0);
                setDisplayKey(currentSong.originalKey);
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Original ({currentSong.originalKey})
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">Original: {currentSong.originalKey}</span>
        </div>

        {/* Capo suggestions */}
        {(() => {
          const suggestions = getCapoSuggestions(displayKey);
          if (suggestions.length === 0) return null;
          return (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-xs text-gray-500">Cejilla:</span>
              {suggestions.map(({ capo, playKey }) => (
                <span
                  key={capo}
                  className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
                >
                  Cejilla {capo} → toca en {playKey}
                </span>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* ChordPro viewer */}
      <Card>
        <ChordProViewer content={transposedContent} />
      </Card>

      {/* Edit modal */}
      {showEdit && (
        <EditSongModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={handleUpdate}
          song={currentSong}
          categories={categories}
          isLoading={isUpdating}
        />
      )}

      {/* Delete confirm */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar canción"
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que quieres eliminar <strong>{currentSong.title}</strong>? Esta acción no
          se puede deshacer.
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
