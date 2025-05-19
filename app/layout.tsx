// Import necessary types and components for the layout
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from '@/components/footer';

// Configure Inter font for the application
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Define metadata for the application
export const metadata: Metadata = {
  title: 'Smart Prices',
  description: 'Smart pricing management system',
};

// Configure viewport settings for responsive design
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#17354D' },
    { media: '(prefers-color-scheme: dark)', color: '#17354D' },
  ],
};

// Root layout component that provides the application structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Main HTML structure with language and hydration settings
    <html lang="en" suppressHydrationWarning>
      {/* Body with layout styling and font configuration */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          inter.variable
        )}
      >
        {/* Header component for navigation */}
        <Header />
        {/* Main content area with responsive padding and max width */}
        <main className="flex-1 container py-4 md:py-8 px-4 md:px-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
        {/* Footer component */}
        <Footer />
        {/* Toaster component for notifications */}
        <Toaster />
      </body>
    </html>
  );
}