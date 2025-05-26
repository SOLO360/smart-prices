'use client';

import React, { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ErrorBoundary } from "react-error-boundary";
import { SubmitHandler } from 'react-hook-form';

const saleSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productId: z.string().min(1, "Product is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "CREDIT"]),
  status: z.enum(["COMPLETED", "PENDING", "CANCELLED"]),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => void;
}

export default function SaleForm({ onSubmit }: SaleFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [customers, setCustomers] = React.useState([]);
  const [products, setProducts] = React.useState([]);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: '',
      productId: '',
      amount: '',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      notes: '',
    },
  });

  useEffect(() => {
    // Fetch customers and products
    fetch('/api/customers')
      .then((res) => res.json())
      .then(setCustomers);
    
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const handleSubmit = async (data: SaleFormData) => {
    startTransition(async () => {
      try {
        await onSubmit({
          ...data,
          amount: parseFloat(data.amount),
          customerId: data.customerId,
          productId: data.productId,
        });
        toast({
          title: "Success",
          description: "Sale recorded successfully",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to record sale",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try submitting the form again.</div>}
      onError={(error) => console.error("Form Error:", error)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                    >
                      <option value="">Select product</option>
                      {products.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.service} - {product.size}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 99.99"
                      {...field}
                      disabled={isPending}
                      className="border border-gray-300 focus-visible:ring-[#17354D]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="TRANSFER">Bank Transfer</option>
                      <option value="CREDIT">Credit</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isPending}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </FormControl>
                <FormDescription>Current status of the sale</FormDescription>
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
                  <Input
                    placeholder="Additional notes about the sale"
                    {...field}
                    disabled={isPending}
                    className="border border-gray-300 focus-visible:ring-[#17354D]"
                  />
                </FormControl>
                <FormDescription>Optional notes about the sale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#17354D] hover:bg-[#17354D]/90 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Sale'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
}