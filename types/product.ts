import type { Product as PrismaProduct } from '@prisma/client';

export type Product = PrismaProduct;

// Optional: Define a type for form data if it differs slightly
export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  unitPrice: number | string; // Allow string during input
  bulkPrice?: number | string | null; // Allow string during input
};
