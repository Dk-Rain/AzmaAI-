import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Loading from './loading';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'StipsLite AI',
  description: 'Effortless Academic Assistance, Powered by AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased ${inter.variable}`}>
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
