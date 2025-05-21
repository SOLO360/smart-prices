// Import necessary types and components for the layout
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from '@/components/footer';
import Navigation from './components/Navigation';

// Configure Inter font for the application
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Define metadata for the application
export const metadata: Metadata = {
  title: 'PriceWise - Business Management',
  description: 'Manage your business operations efficiently',
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
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">PriceWise</h1>
              <Navigation />
            </div>
          </div>
        </header>
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