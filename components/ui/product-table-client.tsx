"use client";

import type { Product } from '@/types/product';
import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';

interface ProductTableClientProps {
  initialProducts: Product[];
}

export function ProductTableClient({ initialProducts }: ProductTableClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Update products if initialProducts changes (e.g., due to revalidation)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);


  const filteredProducts = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) {
      return products;
    }
    return products.filter(
      (product) =>
        product.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.service.toLowerCase().includes(lowerCaseSearchTerm) ||
        (product.size && product.size.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [searchTerm, products]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Adjust currency as needed
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by category, service, or size..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full md:w-1/3"
          aria-label="Search products"
        />
      </div>
      <ScrollArea className="whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Bulk Price</TableHead>
              <TableHead>Turnaround</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.category}</TableCell>
                  <TableCell>{product.service}</TableCell>
                  <TableCell>{product.size || '-'}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.bulkPrice)}
                  </TableCell>
                  <TableCell>{product.turnaroundTime || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {product.notes || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found {searchTerm && `for "${searchTerm}"`}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
