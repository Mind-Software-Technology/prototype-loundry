import type { Metadata } from 'next';
import './globals.css';
import { LaundryProvider } from '@/context/LaundryContext';

export const metadata: Metadata = {
  title: 'CleanWave POS - Sistem Kasir & Manajemen Laundry',
  description: 'Aplikasi Point of Sale (POS) dan pelacakan antrian cucian modern untuk bisnis laundry profesional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <LaundryProvider>
          {children}
        </LaundryProvider>
      </body>
    </html>
  );
}
