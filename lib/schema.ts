import { z } from 'zod';

// Schema for creating a new product (no ID required)
export const createProductSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  service: z.string().min(1, { message: "Service is required" }),
  size: z.string().optional(),
  unitPrice: z.coerce
    .number({ invalid_type_error: "Unit price must be a number" })
    .positive({ message: "Unit price must be positive" }),
  bulkPrice: z.coerce
    .number({ invalid_type_error: "Bulk price must be a number" })
    .positive({ message: "Bulk price must be positive" })
    .nullable()
    .optional(),
  turnaroundTime: z.string().optional(),
  notes: z.string().optional(),
});

// Schema for existing products (with ID)
export const productSchema = createProductSchema.extend({
  id: z.string().or(z.number()).optional(),
});

// For creating new products
export type CreateProductSchema = z.infer<typeof createProductSchema>;

// For existing products
export type ProductSchema = z.infer<typeof productSchema>;