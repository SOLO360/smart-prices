"use client";

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, type CreateProductSchema } from '../lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { addProductAction } from '@/actions/product-actions';
import { ErrorBoundary } from "react-error-boundary";
import { SubmitHandler } from 'react-hook-form';

export function AddProductForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateProductSchema, any, CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      category: '',
      service: '',
      size: '', // Provide a default empty string for required fields
      unitPrice: 0,
      bulkPrice: null,
      turnaroundTime: '', // Provide a default empty string for required fields
      notes: '', // Provide a default empty string for required fields
    },
  });

  interface AddProductResult {
    success: boolean;
    error?: string | null;
  }

  const onSubmit: SubmitHandler<CreateProductSchema> = async (values: CreateProductSchema) => {
    startTransition(async () => {
      const result: AddProductResult = await addProductAction(values);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Product added successfully.",
          variant: "default",
        });
        form.reset();
        router.refresh(); // Refresh current route to see changes if on product list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add product. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try submitting the form again.</div>}
      onError={(error) => console.error("Form Error:", error)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<CreateProductSchema>)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
            <Input placeholder="e.g., Apparel" {...field} disabled={isPending} className="border border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., T-Shirt Printing" {...field} disabled={isPending} className='border border-gray-300' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Large, 11oz" {...field} disabled={isPending} className='border border-gray-300' />
                  </FormControl>
                  <FormDescription>Optional size designation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 19.99"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={event => {
                        const value = event.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={isPending}
                      className='border border-gray-300'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bulkPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulk Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15.99 (Optional)"
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={event => {
                        const value = event.target.value;
                        field.onChange(value === '' ? null : parseFloat(value));
                      }}
                      disabled={isPending}
                      className='border border-gray-300'
                    />
                  </FormControl>
                  <FormDescription>Price for bulk orders.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="turnaroundTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turnaround Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 3-5 business days" {...field} disabled={isPending} className='border border-gray-300' />
                </FormControl>
                <FormDescription>Estimated production time.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional details..." {...field} disabled={isPending}  className='border border-gray-300' />
                </FormControl>
                <FormDescription className='text-muted'>Internal notes or customer-facing details.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
        </form>
      </Form>
    </ErrorBoundary>
  );
}