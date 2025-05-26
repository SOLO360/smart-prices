// Client-side component for the product table
"use client";

// Import necessary types and components
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
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import EditProductForm from '@/components/edit-product-form'; // Adjust the path as needed

// Number of items to display per page
const ITEMS_PER_PAGE = 10;

// Interface for component props
interface ProductTableClientProps {
  initialProducts: Product[];
}

// Main product table component
export function ProductTableClient({ initialProducts }: ProductTableClientProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle data updates when initial products change
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(1); // Reset to first page when data changes
  }, [initialProducts]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter products based on search term
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

  // Calculate total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts.length]);

  // Get products for current page
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Handle edit button click
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      // await deleteProductAPI(deletingProductId);
      await fetch(`/api/product?id=${deletingProductId}`, {
        method: 'DELETE',
      });
      setProducts((prev) => prev.filter(p => p.id !== Number(deletingProductId)));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const onSuccess = () => {
    // Handle success logic, e.g., refresh the product list or close the dialog
    setIsEditDialogOpen(false);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0, // TZS doesn't use cents
      maximumFractionDigits: 0
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
          className="pl-8 w-full md:w-1/3 border border-gray-300 bg-muted/50 focus-visible:ring-[#17354D]"
          aria-label="Search products"
        />
      </div>
      <ScrollArea className="whitespace-nowrap rounded-md border-none ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-left">Unit Price</TableHead>
              <TableHead className="text-left">Bulk Price</TableHead>
              <TableHead>Turnaround</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className=" p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <TableRow key={product.id} className=''>
                  <TableCell className="font-medium">{product.category}</TableCell>
                  <TableCell>{product.service}</TableCell>
                  <TableCell>{product.size || '-'}</TableCell>
                  <TableCell className="text-left">
                    {formatCurrency(product.unitPrice)}
                  </TableCell>
                  <TableCell className="text-left">
                    {formatCurrency(product.bulkPrice)}
                  </TableCell>
                  <TableCell>{product.turnaroundTime || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {product.notes || '-'}
                  </TableCell>
                  <TableCell className="text-left m-4">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(product)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(String(product.id))}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No products found {searchTerm && `for "${searchTerm}"`}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Product Dialog */}
      <Dialog modal={true} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] max-w-[500px] p-6 bg-background rounded-lg shadow-lg border z-[9999]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm
              product={editingProduct}
              onSuccess={onSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog modal={true} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] max-w-[400px] p-6 bg-background rounded-lg shadow-lg border z-[9999]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
