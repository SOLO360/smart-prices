'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddProductForm } from "@/components/add-product-form";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  category: string;
  service: string;
  size: string;
  unitPrice: number;
  bulkPrice: number;
  turnaroundTime: string;
  notes?: string;
}

export default function PricesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products', {
          // Add cache: 'no-store' to prevent caching
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || [
      product.category,
      product.service,
      product.size,
      product.turnaroundTime,
      product.notes
    ].some(field => 
      field?.toLowerCase().includes(searchLower)
    );
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  // Navigation handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        const response = await fetch('/api/products/bulk-delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedProducts }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete products');
        }

        setRefreshTrigger(prev => prev + 1);
        setSelectedProducts([]);
        toast({
          title: 'Success',
          description: `Successfully deleted ${selectedProducts.length} products`,
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to delete products',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle single product delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        setRefreshTrigger(prev => prev + 1);
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Price Lists</h1>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProducts.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#17354D] hover:bg-[#122941] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <AddProductForm onSuccess={() => {
            setIsAddDialogOpen(false);
            setRefreshTrigger(prev => prev + 1); // Trigger refresh when product is added
          }} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="modal sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {productToEdit && (
            <AddProductForm
              initialData={productToEdit}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setProductToEdit(null);
                setRefreshTrigger(prev => prev + 1);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="card-style">
        <div className="card-header">
          <h2 className="card-title">Product Prices</h2>
          <p className="card-description">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} entries
          </p>
        </div>
        <div className="card-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={currentProducts.length > 0 && selectedProducts.length === currentProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(currentProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Bulk Price</TableHead>
                <TableHead>Turnaround Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.category}</TableCell>
                  <TableCell>{product.service}</TableCell>
                  <TableCell>{product.size}</TableCell>
                  <TableCell className="text-right">${product.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${product.bulkPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.turnaroundTime}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.notes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {currentProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="card-footer">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">Items per page</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">Page</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={handlePageInputChange}
                  className="w-16 h-8 text-center"
                />
                <span className="text-sm">of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 