'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { authRequest } from '@/services/apiClient';

interface OrgStats {
  totalUsers: number;
  totalSongs: number;
  totalSetlists: number;
  upcomingEvents: number;
}

const QUICK_ACCESS = [
  {
    label: 'Canciones',
    description: 'Gestiona tu repertorio',
    href: '/songs',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
    color: 'text-blue-600 bg-blue-50',
  },
  {
    label: 'Setlists',
    description: 'Organiza tus servicios',
    href: '/setlists',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    color: 'text-purple-600 bg-purple-50',
  },
  {
    label: 'Eventos',
    description: 'Programa tus ensayos',
    href: '/events',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: 'text-green-600 bg-green-50',
  },
  {
    label: 'Equipo',
    description: 'Coordina tus músicos',
    href: '/team',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrgStats | null>(null);
  const canSeeStats = user?.role === 'ADMIN' || user?.role === 'LEADER';

  useEffect(() => {
    if (!canSeeStats) return;
    authRequest<{ success: boolean; data: OrgStats }>('/organizations/current/stats')
      .then((res) => setStats((res as any).data))
      .catch(() => {});
  }, [canSeeStats]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aquí encontrarás un resumen de tu actividad musical.
        </p>
      </div>

      {/* Stats — solo ADMIN y LEADER */}
      {canSeeStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Canciones',
              value: stats?.totalSongs,
              href: '/songs',
              color: 'text-blue-600',
            },
            {
              label: 'Setlists',
              value: stats?.totalSetlists,
              href: '/setlists',
              color: 'text-purple-600',
            },
            {
              label: 'Próximos eventos',
              value: stats?.upcomingEvents,
              href: '/events',
              color: 'text-green-600',
            },
            {
              label: 'Miembros activos',
              value: stats?.totalUsers,
              href: '/team',
              color: 'text-orange-600',
            },
          ].map((stat) => (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stats ? stat.value : <span className="text-gray-300">—</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACCESS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Primeros pasos</h2>
        <ul className="space-y-2">
          {[
            { text: 'Crea tu primera canción con acordes en formato ChordPro', href: '/songs' },
            { text: 'Organiza un setlist para tu próximo servicio', href: '/setlists' },
            { text: 'Programa un ensayo en el calendario de eventos', href: '/events' },
            { text: 'Asigna músicos a tu equipo de alabanza', href: '/team' },
          ].map((step) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-blue-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="group-hover:underline">{step.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
