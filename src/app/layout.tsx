import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'ArenaMind 2026 — AI-Powered FIFA World Cup Stadium Assistant',
  description:
    'ArenaMind is a GenAI-powered smart stadium platform for FIFA World Cup 2026. Real-time crowd management, multilingual fan assistance, accessible navigation, and operational intelligence — all in one place.',
  keywords: [
    'FIFA World Cup 2026',
    'smart stadium',
    'AI assistant',
    'crowd management',
    'stadium navigation',
    'GenAI',
    'accessibility',
    'fan experience',
  ],
  openGraph: {
    title: 'ArenaMind 2026',
    description: 'AI-powered smart stadium platform for FIFA World Cup 2026',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <div className="bg-animated" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
