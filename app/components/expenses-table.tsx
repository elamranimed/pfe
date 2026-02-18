'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Expense } from '@/app/lib/types';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import { ExpenseModal } from './expense-modal';

interface ExpensesTableProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
  onAddExpense,
}: ExpensesTableProps) {
  const [showModal, setShowModal] = useState(false);

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, string> = {
      salary: 'Salaire',
      electricity: 'Électricité',
      water: 'Eau',
      maintenance: 'Maintenance',
      insurance: 'Assurance',
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      salary: 'bg-purple-100 text-purple-700',
      electricity: 'bg-yellow-100 text-yellow-700',
      water: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-orange-100 text-orange-700',
      insurance: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-700">Payée</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-700">En Attente</Badge>;
  };

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter Dépense
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-700">Date</TableHead>
              <TableHead className="text-slate-700">Catégorie</TableHead>
              <TableHead className="text-slate-700">Description</TableHead>
              <TableHead className="text-slate-700">Fournisseur</TableHead>
              <TableHead className="text-slate-700">Montant</TableHead>
              <TableHead className="text-slate-700">Statut</TableHead>
              <TableHead className="text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  Aucune dépense pour cette période
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(expense.category)}>
                      {getCategoryBadge(expense.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-slate-700">
                    {expense.supplier}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseModal
        open={showModal}
        onOpenChange={setShowModal}
        onSave={(expense) => {
          onAddExpense(expense);
          setShowModal(false);
        }}
      />
    </div>
  );
}
