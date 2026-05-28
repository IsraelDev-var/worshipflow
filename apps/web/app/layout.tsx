import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorshipFlow',
  description: 'Sistema de gestión musical para bandas de iglesia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-white dark:bg-slate-900`}>{children}</body>
    </html>
  );
}
