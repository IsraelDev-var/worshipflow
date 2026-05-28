'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSongStore } from '@/store/songStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { KEYS } from '@/utils/transpose';
import { categoriesApi } from '@/services/categories.api';
import { ChordProViewer } from '@/components/songs/ChordProViewer';
import type { Category } from '@/types';

function SongFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  categories: Category[];
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    originalKey: 'C',
    tempo: '',
    timeSignature: '4/4',
    content: '',
    categoryIds: [] as string[],
  });
  const [error, setError] = useState('');

  const reset = () =>
    setForm({
      title: '',
      author: '',
      originalKey: 'C',
      tempo: '',
      timeSignature: '4/4',
      content: '',
      categoryIds: [],
    });

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

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
      handleClose();
    } catch {
      setError('Error al crear la canción. Intenta de nuevo.');
    }
  };

  const toggleCategory = (id: string) =>
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva canción" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la canción"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Artista o compositor"
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
              placeholder="120"
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
              rows={10}
              placeholder={
                '[G]Santo, [Em]santo, [C]santo es el [D]Señor\n[G]Dios todo [Em]poderoso'
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div
              className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 overflow-y-auto"
              style={{ minHeight: '10rem', maxHeight: '16rem' }}
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
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Crear canción
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function SongsPage() {
  const router = useRouter();
  const { songs, isLoading, total, fetchSongs, createSong } = useSongStore();
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSongs();
    categoriesApi
      .list()
      .then((r) => setCategories(r.data ?? []))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(() => {
    fetchSongs({
      search: search || undefined,
      key: filterKey || undefined,
      categoryId: filterCategory || undefined,
    });
  }, [search, filterKey, filterCategory]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [search, filterKey, filterCategory]);

  const handleCreate = async (data: any) => {
    setIsCreating(true);
    try {
      const song = await createSong(data);
      router.push(`/songs/${song.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} canciones en el repertorio</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva canción
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o autor..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las tonalidades</option>
            {KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : songs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          }
          title="No hay canciones aún"
          description="Empieza agregando la primera canción con acordes en formato ChordPro."
          action={<Button onClick={() => setShowModal(true)}>Crear primera canción</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => router.push(`/songs/${song.id}`)}
              className="text-left"
            >
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {song.title}
                  </h3>
                  <span className="shrink-0 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">
                    {song.originalKey}
                  </span>
                </div>
                {song.author && <p className="text-xs text-gray-500 mb-2">{song.author}</p>}
                <div className="flex items-center gap-2 flex-wrap mt-auto">
                  {song.tempo && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {song.tempo} bpm
                    </span>
                  )}
                  {song.timeSignature && song.timeSignature !== '4/4' && (
                    <span className="text-xs text-gray-400">{song.timeSignature}</span>
                  )}
                  {song.categories?.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <SongFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        categories={categories}
        isLoading={isCreating}
      />
    </div>
  );
}
