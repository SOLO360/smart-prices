'use client';

import React, { useTransition } from 'react';
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

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  category: z.enum(["REGULAR", "PREMIUM", "SUBSCRIBER", "WHOLESALE"]),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      category: 'REGULAR',
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast({
          title: "Success",
          description: "Customer added successfully",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add customer",
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., John Doe" 
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="e.g., john@example.com" 
                      {...field} 
                      disabled={isPending} 
                      className="border border-gray-300 focus-visible:ring-[#17354D]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="e.g., (555) 123-4567" 
                      {...field} 
                      disabled={isPending} 
                      className="border border-gray-300 focus-visible:ring-[#17354D]" 
                    />
                  </FormControl>
                  <FormDescription>Optional phone number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Acme Inc." 
                      {...field} 
                      disabled={isPending} 
                      className="border border-gray-300 focus-visible:ring-[#17354D]" 
                    />
                  </FormControl>
                  <FormDescription>Optional company name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 123 Main St, City, State" 
                    {...field} 
                    disabled={isPending} 
                    className="border border-gray-300 focus-visible:ring-[#17354D]" 
                  />
                </FormControl>
                <FormDescription>Optional address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isPending}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="SUBSCRIBER">Subscriber</option>
                    <option value="WHOLESALE">Wholesale</option>
                  </select>
                </FormControl>
                <FormDescription>Customer category type</FormDescription>
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
                  Adding...
                </>
              ) : (
                'Add Customer'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
}