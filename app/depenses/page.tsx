'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ExpensesTable } from '@/components/expenses-table';
import { ExpenseModal } from '@/components/expense-modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { exportToXLSX } from '@/lib/utils';
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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/depenses')
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is an array before mapping
        if (Array.isArray(data)) {
          setExpenses(data.map((d: any) => ({
            id: String(d.id_expense),
            date: new Date(d.date).toISOString().split('T')[0],
            category: d.category,
            description: d.description,
            supplier: d.provider,
            amount: d.amount,
            status: 'paid'
          })));
        } else {
          console.error('Unexpected data format:', data);
          setExpenses([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch expenses:', err);
        setExpenses([]);
      });
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
          status: 'paid',
          createdAt: new Date().toISOString()
        };
        setExpenses([...expenses, savedExpense]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportXLSX = () => {
    const dataToExport = filteredExpenses.map(e => ({
      'Date': e.date,
      'Catégorie': e.category,
      'Description': e.description,
      'Fournisseur': e.supplier,
      'Montant': e.amount,
      'Statut': e.status === 'paid' ? 'Payée' : 'En Attente'
    }));
    exportToXLSX(dataToExport, 'Depenses');
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

        <Card className="border-border shadow-sm p-0">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 p-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Période</span>
                <Select
                  value={filterPeriod}
                  onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}
                >
                  <SelectTrigger className="w-[150px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Ce Mois</SelectItem>
                    <SelectItem value="three-months">3 Derniers Mois</SelectItem>
                    <SelectItem value="all">Tout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportXLSX}>
                <Download className="w-4 h-4" />
                Exporter XLSX
              </Button>
              <Button onClick={() => setShowModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter Dépense
              </Button>
            </div>
          </CardHeader>
          
          <div className="p-6">
            <ExpensesTable
              expenses={filteredExpenses}
            />
          </div>
        </Card>
      </div>
      
      <ExpenseModal
        open={showModal}
        onOpenChange={setShowModal}
        onSave={(expense) => {
          handleAddExpense(expense);
          setShowModal(false);
        }}
      />
    </MainLayout>
  );
}
