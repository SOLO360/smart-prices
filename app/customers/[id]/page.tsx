'use client';

import CustomerDetails from '../../components/CustomerDetails';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDetailsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Customer Details</h1>
      </div>
      
      <CustomerDetails />
    </div>
  );
} 