'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productSchema } from '@/lib/schema';
import { updateProductAction } from '@/actions/product-actions';
import { Input } from './ui/input';
import { Product } from '@/types/product';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

interface EditProductFormProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema as any),
    defaultValues: {
      category: product.category,
      service: product.service,
      size: product.size,
      unitPrice: product.unitPrice,
      bulkPrice: product.bulkPrice,
      turnaroundTime: product.turnaroundTime,
      notes: product.notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      const result = await updateProductAction(String(product.id), values);
      if (result.success) {
        toast({
          title: 'Product updated successfully!',
          description: 'The product has been updated.',
          variant: 'default',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Failed to update product.',
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'An unexpected error occurred.',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic product information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Apparel" {...field} disabled={form.formState.isSubmitting} className="border border-gray-300 focus-visible:ring-[#17354D]" />
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
                  <Input placeholder="e.g., T-Shirt Printing" {...field} disabled={form.formState.isSubmitting} className="border border-gray-300 focus-visible:ring-[#17354D]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing and size information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Large, 11oz" {...field} disabled={form.formState.isSubmitting} className="border border-gray-300 focus-visible:ring-[#17354D]" />
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
                    disabled={form.formState.isSubmitting}
                    className="border border-gray-300 focus-visible:ring-[#17354D]"
                  />
                </FormControl>
                <FormMessage className="text-[#F92D5E]" />
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
                    disabled={form.formState.isSubmitting}
                    className="border border-gray-300 focus-visible:ring-[#17354D]"
                  />
                </FormControl>
                <FormDescription>Price for bulk orders.</FormDescription>
                <FormMessage className="text-[#F92D5E]" />
              </FormItem>
            )}
          />
        </div>

        {/* Additional details */}
        <FormField
          control={form.control}
          name="turnaroundTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turnaround Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3-5 business days" {...field} disabled={form.formState.isSubmitting} className="border border-gray-300 focus-visible:ring-[#17354D]" />
              </FormControl>
              <FormDescription>Estimated production time.</FormDescription>
              <FormMessage className="text-[#F92D5E]" />
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
                <Textarea placeholder="Any additional details..." {...field} disabled={form.formState.isSubmitting} className="border border-gray-300 focus-visible:ring-[#17354D]" />
              </FormControl>
              <FormDescription className="text-muted">Internal notes or customer-facing details.</FormDescription>
              <FormMessage className="text-[#F92D5E]" />
            </FormItem>
          )}
        />

        {/* Submit button with loading state */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#17354D] hover:bg-[#122941] text-white">
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProductForm;