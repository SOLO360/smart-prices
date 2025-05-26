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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden input for product ID */}
      <input type="hidden" {...form.register('id')} />
      <input type="hidden" value={product.id} />
      <div>
        <label htmlFor="category">Category</label>
        <Input id="category" {...form.register('category')} />
        {form.formState.errors.category && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="service">Service</label>
        <Input id="service" {...form.register('service')} />
        {form.formState.errors.service && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.service.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="size">Size</label>
        <Input id="size" {...form.register('size')} />
        {form.formState.errors.size && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.size.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="unitPrice">Unit Price</label>
        <Input
          id="unitPrice"
          type="number"
          step="0.01"
          {...form.register('unitPrice', { valueAsNumber: true })}
        />
        {form.formState.errors.unitPrice && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.unitPrice.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bulkPrice">Bulk Price</label>
        <Input
          id="bulkPrice"
          type="number"
          step="0.01"
          {...form.register('bulkPrice', { valueAsNumber: true })}
        />
        {form.formState.errors.bulkPrice && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.bulkPrice.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="turnaroundTime">Turnaround Time</label>
        <Input id="turnaroundTime" {...form.register('turnaroundTime')} />
        {form.formState.errors.turnaroundTime && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.turnaroundTime.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" {...form.register('notes')} />
        {form.formState.errors.notes && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Updating...' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;