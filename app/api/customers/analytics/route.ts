import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, subMonths, format } from 'date-fns';

const prisma = new PrismaClient();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: any = null;
let lastFetchTime = 0;

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Get total customers and customers by category in a single query
    const [totalCustomers, customersByCategory] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
      }),
    ]);

    // Get customers by month (last 12 months) using a more efficient query
    const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));
    const customersByMonth = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "Customer"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Get top customers by sales using a more efficient query
    const topCustomers = await prisma.$queryRaw`
      SELECT 
        c.name,
        COALESCE(SUM(s.amount), 0) as total_spent
      FROM "Customer" c
      LEFT JOIN "Sale" s ON c.id = s."customerId"
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
      LIMIT 5
    `;

    // Calculate customer retention using a more efficient query
    const customerRetention = await prisma.$queryRaw`
      WITH monthly_active_customers AS (
        SELECT 
          DATE_TRUNC('month', s."createdAt") as month,
          COUNT(DISTINCT s."customerId") as active_customers
        FROM "Sale" s
        WHERE s."createdAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', s."createdAt")
      ),
      total_customers_by_month AS (
        SELECT 
          DATE_TRUNC('month', c."createdAt") as month,
          COUNT(*) as total_customers
        FROM "Customer" c
        WHERE c."createdAt" <= CURRENT_DATE
        GROUP BY DATE_TRUNC('month', c."createdAt")
      )
      SELECT 
        t.month,
        CASE 
          WHEN t.total_customers > 0 THEN 
            (COALESCE(a.active_customers, 0)::float / t.total_customers) * 100
          ELSE 0
        END as retention_rate
      FROM total_customers_by_month t
      LEFT JOIN monthly_active_customers a ON t.month = a.month
      ORDER BY t.month ASC
    `;

    const response = {
      totalCustomers,
      customersByCategory: customersByCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
      customersByMonth: customersByMonth.map((item: any) => ({
        month: format(new Date(item.month), 'MMM yyyy'),
        count: parseInt(item.count),
      })),
      topCustomers: topCustomers.map((customer: any) => ({
        name: customer.name,
        totalSpent: parseFloat(customer.total_spent),
      })),
      customerRetention: customerRetention.map((item: any) => ({
        month: format(new Date(item.month), 'MMM yyyy'),
        retentionRate: parseFloat(item.retention_rate),
      })),
    };

    // Update cache
    cachedData = response;
    lastFetchTime = now;

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/customers/analytics error:', error);
    return NextResponse.json(
      { error: 'Error fetching customer analytics' },
      { status: 500 }
    );
  }
} 