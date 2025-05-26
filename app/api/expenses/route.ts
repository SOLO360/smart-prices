import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.category || !body.type || !body.description) {
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

    const expense = await prisma.expense.create({
      data: {
        amount: Number(body.amount),
        category: body.category,
        type: body.type,
        description: body.description,
        isRecurring: body.isRecurring || false,
        recurringPeriod: body.recurringPeriod || null,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json(
      { error: 'Error creating expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 