import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CupOferta - La comunidad #1 de ahorradores',
  description: 'Nunca más pagues el precio completo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased overflow-x-hidden font-body transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
