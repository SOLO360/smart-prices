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
    return NextResponse.json({ error: 'Error fetching sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sale = await prisma.sale.create({
      data: {
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        status: body.status,
        customerId: body.customerId,
        productId: body.productId,
        notes: body.notes,
      },
      include: {
        customer: true,
        product: true,
      },
    });
    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating sale' }, { status: 500 });
  }
} 