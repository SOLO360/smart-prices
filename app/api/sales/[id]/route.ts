import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const saleId = parseInt(params.id);

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: { status },
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('PATCH /api/sales/[id] error:', error);
    return NextResponse.json(
      { error: 'Error updating sale status' },
      { status: 500 }
    );
  }
} 