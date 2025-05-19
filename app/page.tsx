import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/types/product';
import { ProductTableClient } from '@/components/product-table-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChevronRight, Package, PieChart, Tag } from 'lucide-react';

// Fetches all products from the database, sorted by category
async function getProducts(): Promise<Product[]> {
  try {
    // Query Prisma to get all products, ordering them alphabetically by category
    const products = await prisma.product.findMany({
      orderBy: {
        category: 'asc',
      },
    });
    return products;
  } catch (error) {
    // Log error and return empty array if fetching fails
    console.error("Failed to fetch products:", error);
    return [];
  }
}

// Fetches various statistics about the products
async function getStats() {
  try {
    // Count total number of products in the database
    const totalProducts = await prisma.product.count();
    
    // Group products by category to get unique category count
    const categories = await prisma.product.groupBy({
      by: ['category'],
    });
    
    // Calculate average unit price across all products
    const priceStats = await prisma.product.aggregate({
      _avg: {
        unitPrice: true,
      },
    });
    
    // Return statistics object with counts and averages
    return {
      totalProducts,
      totalCategories: categories.length,
      averagePrice: priceStats._avg.unitPrice || 0,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      totalProducts: 0,
      totalCategories: 0,
      averagePrice: 0,
    };
  }
}

// Main home page component that displays product statistics and list
export default async function HomePage() {
  // Fetch products and statistics when page loads
  const initialProducts = await getProducts();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold text-primary">{stats.totalProducts}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <h3 className="text-2xl font-bold text-primary">{stats.totalCategories}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow ">
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Price</p>
              <h3 className="text-2xl font-bold text-primary">TZS {stats.averagePrice.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List Section */}
      <Card className="shadow-sm hover:shadow-md transition-shadow mt-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Product Price List</CardTitle>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>Browse and search through available products and services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProductTableSkeleton />}>
            <ProductTableClient initialProducts={initialProducts} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading Skeleton for the table
function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full md:w-1/3" /> {/* Search input skeleton */}
      <div className="rounded-lg border border-b-gray-400">
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center p-4 space-y-2 sm:space-y-0 sm:space-x-4">
              <Skeleton className="h-6 w-full sm:w-1/6" />
              <Skeleton className="h-6 w-full sm:w-1/6" />
              <Skeleton className="h-6 w-1/2 sm:w-1/6" />
              <Skeleton className="h-6 w-1/4 sm:w-1/12" />
              <Skeleton className="h-6 w-1/4 sm:w-1/12" />
              <Skeleton className="h-6 w-1/2 sm:w-1/6" />
              <Skeleton className="h-6 w-1/3 sm:w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ensure Prisma disconnects when the app shuts down
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export const revalidate = 60; // Revalidate data every 60 seconds