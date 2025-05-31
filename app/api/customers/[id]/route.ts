import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        sales: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: true,
          },
        },
      },
    });

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedCustomer = {
      ...customer,
      sales: customer.sales.map(sale => ({
        id: sale.id,
        date: sale.createdAt,
        amount: sale.amount,
        status: sale.status,
        items: [{
          name: sale.product.service,
          quantity: 1,
          price: sale.amount,
        }],
      })),
    };

    return NextResponse.json(transformedCustomer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 