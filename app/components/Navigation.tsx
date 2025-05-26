'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, List, Users, DollarSign, Receipt } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/prices',
      label: 'Price List',
      icon: List,
    },
    {
      href: '/customers',
      label: 'Customers',
      icon: Users,
    },
    {
      href: '/sales',
      label: 'Sales',
      icon: DollarSign,
    },
    {
      href: '/expenses',
      label: 'Expenses',
      icon: Receipt,
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-primary',
              pathname === link.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
} 