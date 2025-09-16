import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Literata, Lato } from 'next/font/google';
import { Suspense } from 'react';
import Loading from './loading';
import { ThemeProvider } from '@/components/theme-provider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const literata = Literata({ subsets: ['latin'], variable: '--font-literata' });
const lato = Lato({ subsets: ['latin'], weight: '400', variable: '--font-lato' });


export const metadata: Metadata = {
  title: 'AZMA AI',
  description: 'Effortless Academic Assistance, Powered by AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable} ${literata.variable} ${lato.variable}`}>
        <GoogleOAuthProvider clientId="198020100585-2odj7e67uik4k6udl6j1q7tcmvnm8u3v.apps.googleusercontent.com">
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <Suspense fallback={<Loading />}>
                    {children}
                </Suspense>
                <Toaster />
            </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
