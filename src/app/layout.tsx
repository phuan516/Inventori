import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { NavigationProvider } from '@/context/NavigationContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Inventori — Your spreadsheet, with a nicer face',
  description: 'A simple inventory tracker for hobby shops. Your data lives in your Google Sheet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SettingsProvider>
            <NavigationProvider>
              {children}
            </NavigationProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
