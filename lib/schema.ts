import { z } from 'zod';

// Schema for creating a new product (no ID required)
export const createProductSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  service: z.string().min(1, { message: "Service is required" }),
  size: z.string().min(1, { message: "Size is required" }),
  unitPrice: z.coerce
    .number({ invalid_type_error: "Unit price must be a number" })
    .positive({ message: "Unit price must be positive" }),
  bulkPrice: z.coerce
    .number({ invalid_type_error: "Bulk price must be a number" })
    .positive({ message: "Bulk price must be positive" })
    .nullable()
    .optional(),
  turnaroundTime: z.string().min(1, { message: "Turnaround time is required" }),
  notes: z.string().min(1, { message: "Notes are required" }),
});

// Schema for existing products (with ID)
export const productSchema = createProductSchema.extend({
  id: z.string().or(z.number()).optional(),
});

// For creating new products
export type CreateProductSchema = z.infer<typeof createProductSchema>;

// For existing products
export type ProductSchema = z.infer<typeof productSchema>;