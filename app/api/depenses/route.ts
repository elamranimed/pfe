import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expenses.findMany({
      orderBy: { date: 'desc' },
    });
    
    // Convert BigInt to Number to avoid JSON serialization error
    const serializedExpenses = expenses.map(expense => ({
      ...expense,
      amount: Number(expense.amount)
    }));
    
    return NextResponse.json(serializedExpenses);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const expense = await prisma.expenses.create({
      data: {
        date: new Date(data.date),
        category: data.category,
        description: data.description,
        provider: data.provider,
        amount: Number(data.amount),
      }
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
