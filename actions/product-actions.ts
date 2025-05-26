"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createProductSchema, productSchema } from '@/lib/schema';

type ActionResult = {
  success: boolean;
  error?: string | null;
};

export async function addProductAction(
  data: unknown, // Accept raw form data
): Promise<ActionResult> {
  // 1. Validate data on the server using createProductSchema (no ID required)
  const validationResult = createProductSchema.safeParse(data);

  if (!validationResult.success) {
    // Log detailed error for debugging
    console.error("Server-side validation failed:", validationResult.error.flatten());
    // Return a generic error message to the client
    return { success: false, error: "Invalid form data. Please check your input." };
  }

  const validatedData = validationResult.data;

  try {
    // 2. Interact with the database
    await prisma.product.create({
      data: {
        category: validatedData.category,
        service: validatedData.service,
        size: validatedData.size || '', // Ensure an empty string if undefined or null
        unitPrice: validatedData.unitPrice, // Already coerced to number by Zod
        // Handle potential empty string for bulkPrice before saving
        bulkPrice: validatedData.bulkPrice ?? 0,
        turnaroundTime: validatedData.turnaroundTime || '', // Ensure an empty string if undefined or null
        notes: validatedData.notes || '', // Ensure empty string if null/undefined
      },
    });

    // 3. Revalidate cache for the homepage
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
     // Determine if it's a known Prisma error or a generic one
     if (error instanceof Error) {
        // You could check for specific Prisma error codes here if needed
        return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: "An unexpected error occurred while adding the product." };
  }
}

export async function updateProductAction(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  // For updates, we use the full productSchema which may include an ID
  const validationResult = productSchema.safeParse(data);

  if (!validationResult.success) {
    console.error("Server-side validation failed for update:", validationResult.error.flatten());
    return { success: false, error: "Invalid form data. Please check your input." };
  }

  const validatedData = validationResult.data;

  try {
    await prisma.product.update({
      where: { id: Number(id) },
      data: {
        category: validatedData.category,
        service: validatedData.service,
        size: validatedData.size || '', 
        unitPrice: validatedData.unitPrice,
        bulkPrice: validatedData.bulkPrice ?? undefined,
        turnaroundTime: validatedData.turnaroundTime || '',
        notes: validatedData.notes || '',
      },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error(`Failed to update product with ID ${id}:`, error);
    if (error instanceof Error) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: "An unexpected error occurred while updating the product." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete product with ID ${id}:`, error);
    if (error instanceof Error) {
      return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: "An unexpected error occurred while deleting the product." };
  }
}