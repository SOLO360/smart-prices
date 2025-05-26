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
import { Checkbox } from '@/components/ui/checkbox';

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category: z.enum(["OPERATIONAL", "INVENTORY", "UTILITIES", "MARKETING", "SALARY", "RENT", "OTHER"]),
  type: z.enum(["RECURRING", "ONE_TIME"]),
  description: z.string().min(1, "Description is required"),
  isRecurring: z.boolean(),
  recurringPeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      category: 'OPERATIONAL',
      type: 'ONE_TIME',
      description: '',
      isRecurring: false,
      recurringPeriod: 'MONTHLY',
    },
  });

  const handleSubmit = async (data: ExpenseFormData) => {
    startTransition(async () => {
      try {
        await onSubmit({
          ...data,
          amount: data.amount,
        });
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add expense",
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
                      <option value="OPERATIONAL">Operational</option>
                      <option value="INVENTORY">Inventory</option>
                      <option value="UTILITIES">Utilities</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="SALARY">Salary</option>
                      <option value="RENT">Rent</option>
                      <option value="OTHER">Other</option>
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                    >
                      <option value="RECURRING">Recurring</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Office supplies"
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

          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Recurring Expense</FormLabel>
                  <FormDescription>
                    Check if this is a recurring expense
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("isRecurring") && (
            <FormField
              control={form.control}
              name="recurringPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring Period *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#17354D] focus:border-transparent"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUALLY">Annually</option>
                    </select>
                  </FormControl>
                  <FormDescription>How often this expense occurs</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
} 