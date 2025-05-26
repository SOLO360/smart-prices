import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        product: true,
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('GET /api/sales error:', error);
    return NextResponse.json({ error: 'Error fetching sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId || !body.productId || !body.amount || !body.paymentMethod || !body.status) {
      console.error('Missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(Number(body.amount))) {
      console.error('Invalid amount:', body.amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.create({
      data: {
        amount: Number(body.amount),
        paymentMethod: body.paymentMethod,
        status: body.status,
        customerId: Number(body.customerId),
        productId: Number(body.productId),
        notes: body.notes || '',
      },
      include: {
        customer: true,
        product: true,
      },
    });
    return NextResponse.json(sale);
  } catch (error) {
    console.error('POST /api/sales error:', error);
    return NextResponse.json(
      { error: 'Error creating sale', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 