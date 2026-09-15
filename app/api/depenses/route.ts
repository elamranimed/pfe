import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expense = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    
    // Convert BigInt to Number to avoid JSON serialization error
    const serializedExpense = expense.map(expense => ({
      ...expense,
      amount: Number(expense.amount)
    }));
    
    return NextResponse.json(serializedExpense);
  } catch (err: any) {
    console.error('Depenses API Error:', err);
    return NextResponse.json({ 
      error: err.message,
      details: err.toString()
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const expense = await prisma.expense.create({
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
