import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackagePlus, List } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* Replace with a proper logo if available */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6">
            <path d="M12 2l7 7-7 7-7-7 7-7z"/>
            <path d="M2 12l10 10L22 12"/>
            <path d="M12 22L2 12"/>
          </svg>
          <span className="font-bold">PriceWise</span>
        </Link>
        <nav className="flex items-center space-x-4">
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
    </header>
  );
}
