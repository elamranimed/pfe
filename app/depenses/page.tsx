'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ExpensesTable } from '@/components/expenses-table';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type FilterPeriod = 'this-month' | 'three-months' | 'all';

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('this-month');

  useEffect(() => {
    fetch('/api/depenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data.map((d: any) => ({
          id: String(d.id_expense),
          date: new Date(d.date).toISOString().split('T')[0],
          category: d.category,
          description: d.description,
          supplier: d.provider,
          amount: d.amount,
          status: 'paid'
        })));
      })
      .catch(console.error);
  }, []);

  const getFilteredExpenses = () => {
    const now = new Date();
    const expenses_sorted = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (filterPeriod === 'this-month') {
      return expenses_sorted.filter((e) => {
        const expenseDate = new Date(e.date);
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filterPeriod === 'three-months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return expenses_sorted.filter(
        (e) => new Date(e.date) >= threeMonthsAgo
      );
    }
    return expenses_sorted;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = async (newExpense: Expense) => {
    try {
      const res = await fetch('/api/depenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newExpense.date,
          category: newExpense.category,
          description: newExpense.description,
          provider: newExpense.supplier,
          amount: newExpense.amount,
        })
      });
      if (res.ok) {
        const d = await res.json();
        const savedExpense: Expense = {
          id: String(d.id_expense),
          date: new Date(d.date).toISOString().split('T')[0],
          category: d.category as any,
          description: d.description,
          supplier: d.provider,
          amount: d.amount,
          status: 'paid'
        };
        setExpenses([...expenses, savedExpense]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dépenses
          </h1>
          <p className="text-muted-foreground">
            Suivi des dépenses d'exploitation du bâtiment
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Période:</span>
              <Select
                value={filterPeriod}
                onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Ce Mois</SelectItem>
                  <SelectItem value="three-months">3 Derniers Mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-red-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Dépenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>

          <ExpensesTable
            expenses={filteredExpenses}
            onAddExpense={handleAddExpense}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
