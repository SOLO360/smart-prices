// Client-side component for the application header
"use client" 
 
// Import necessary components and utilities
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackagePlus, List, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Main header component that provides navigation
export function Header() {
  // State for mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Smart Prices</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <List className="mr-2 h-4 w-4" /> View Products
            </Link>
          </Button>
          <Button asChild>
            <Link href="/add">
              <PackagePlus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t",
          isMenuOpen ? "max-h-40" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 py-2 space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <List className="mr-2 h-4 w-4" /> View Products
            </Link>
          </Button>
          <Button className="w-full justify-start" asChild>
            <Link href="/add" onClick={() => setIsMenuOpen(false)}>
              <PackagePlus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}