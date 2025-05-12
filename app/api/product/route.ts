import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      category,
      service,
      size,
      unitPrice,
      bulkPrice,
      turnaroundTime,
      notes,
    } = body;

    if (
      !category ||
      !service ||
      !size ||
      isNaN(unitPrice) ||
      isNaN(bulkPrice) ||
      !turnaroundTime
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        category,
        service,
        size,
        unitPrice: parseFloat(unitPrice),
        bulkPrice: parseFloat(bulkPrice),
        turnaroundTime,
        notes,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('POST /api/product error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while saving the product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid or missing ID' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/product error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while deleting the product.' },
      { status: 500 }
    );
  }
}
  