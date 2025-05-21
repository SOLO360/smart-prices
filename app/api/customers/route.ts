import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: true,
      },
    });
    return NextResponse.json(customers);
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