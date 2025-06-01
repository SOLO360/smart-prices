import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    // Get total count for pagination
    const total = await prisma.customer.count({ where });

    // Fetch customers with pagination and minimal includes
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        category: true,
        createdAt: true,
        _count: {
          select: {
            sales: true,
          },
        },
        sales: {
          select: {
            amount: true,
          },
        },
      },
    });

    // Calculate total sales amount for each customer
    const customersWithSales = customers.map(customer => ({
      ...customer,
      totalSales: customer.sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
    }));

    console.log('Found customers:', customersWithSales);

    return NextResponse.json({
      customers: customersWithSales,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        address: body.address,
        category: body.category,
      },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 });
  }
} 