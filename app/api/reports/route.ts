import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Sale {
  id: number;
  customerId: number;
  productId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    category: string;
  };
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  type: string;
  description: string;
  isRecurring: boolean;
  recurringPeriod: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  sales: Sale[];
}

interface Product {
  id: number;
  category: string;
  service: string;
  size: string;
  unitPrice: number;
  bulkPrice: number;
  turnaroundTime: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  sales: Sale[];
}

export async function POST(request: Request) {
  try {
    const { dateRange, reportType } = await request.json();
    const { from, to } = dateRange;

    // Fetch all relevant data
    const [sales, expenses, customers, products] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        include: {
          customer: true,
          product: true,
        },
      }),
      prisma.expense.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      }),
      prisma.customer.findMany({
        include: {
          sales: {
            where: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.product.findMany({
        include: {
          sales: {
            where: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
            include: {
              product: true,
            },
          },
        },
      }),
    ]) as [Sale[], Expense[], Customer[], Product[]];

    // Calculate total sales
    const totalSales = sales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    // Calculate net profit
    const netProfit = totalSales - totalExpenses;

    // Calculate sales by category
    const salesByCategory = sales.reduce((acc: Record<string, number>, sale: Sale) => {
      const category = sale.product.category;
      acc[category] = (acc[category] || 0) + sale.amount;
      return acc;
    }, {});

    // Calculate sales by month
    const salesByMonth = sales.reduce((acc: Record<string, number>, sale: Sale) => {
      const month = new Date(sale.createdAt).toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + sale.amount;
      return acc;
    }, {});

    // Calculate top customers
    const topCustomers = customers
      .map((customer: Customer) => ({
        name: customer.name,
        totalSpent: customer.sales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Calculate top products
    const topProducts = products
      .map((product: Product) => ({
        name: `${product.service} - ${product.size}`,
        totalSales: product.sales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return NextResponse.json({
      totalSales,
      totalExpenses,
      netProfit,
      salesByCategory: Object.entries(salesByCategory).map(([category, amount]) => ({
        category,
        amount,
      })),
      salesByMonth: Object.entries(salesByMonth).map(([month, amount]) => ({
        month,
        amount,
      })),
      topCustomers,
      topProducts,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 