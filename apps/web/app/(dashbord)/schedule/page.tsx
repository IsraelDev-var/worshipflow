'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/store/eventStore';
import { Button } from '@/components/ui/Button';
import type { Event } from '@/types';

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
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SchedulePage() {
  const router = useRouter();
  const { events, fetchEvents } = useEventStore();
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetchEvents({ limit: 200 });
  }, []);

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  const goToday = () => setCurrent(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const firstDay = current.getDay();
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const today = new Date();

  const eventsByDate = new Map<string, Event[]>();
  events.forEach((ev) => {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push(ev);
  });

  const getEventsForDay = (day: number): Event[] => {
    const key = `${current.getFullYear()}-${current.getMonth()}-${day}`;
    return eventsByDate.get(key) ?? [];
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vista mensual de eventos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToday}>
            Hoy
          </Button>
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 w-36 text-center">
            {MONTH_NAMES[current.getMonth()]} {current.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <Button size="sm" onClick={() => router.push('/events')}>
            Lista de eventos
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-22 border-b border-r border-gray-100 bg-gray-50/50"
                />
              );
            }

            const cellDate = new Date(current.getFullYear(), current.getMonth(), day);
            const isToday = isSameDay(cellDate, today);
            const dayEvents = getEventsForDay(day);
            const isLastRow = idx >= cells.length - 7;
            const isLastCol = (idx + 1) % 7 === 0;

            return (
              <div
                key={day}
                className={`min-h-22 p-1.5 flex flex-col gap-1
                  ${!isLastRow ? 'border-b' : ''} ${!isLastCol ? 'border-r' : ''} border-gray-100`}
              >
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full self-start
                    ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                >
                  {day}
                </span>
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => router.push(`/events/${ev.id}`)}
                    className="w-full text-left"
                  >
                    <span
                      className={`block text-xs px-1.5 py-0.5 rounded font-medium truncate
                        ${
                          ev.type === 'SERVICE'
                            ? 'bg-blue-100 text-blue-800'
                            : ev.type === 'REHEARSAL'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {ev.title}
                    </span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3} más</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          Servicio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          Ensayo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          Especial
        </span>
      </div>
    </div>
  );
}
