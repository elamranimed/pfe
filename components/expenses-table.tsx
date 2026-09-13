'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface ExpensesTableProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
}: Omit<ExpensesTableProps, 'onAddExpense'>) {
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
      salary: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
      electricity: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
      water: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      maintenance: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
      insurance: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
    return colors[category] || 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge variant="success">Payée</Badge>;
    }
    return <Badge variant="warning">En Attente</Badge>;
  };

  const columns: ColumnDef<Expense>[] = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => (
        <Badge className={getCategoryColor(row.original.category)}>
          {getCategoryBadge(row.original.category)}
        </Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'supplier',
      header: 'Fournisseur',
      cell: ({ row }) => <span className="text-foreground">{row.original.supplier}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.amount)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ], []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={expenses}
        searchKey="description"
        searchPlaceholder="Rechercher par description..."
      />
    </div>
  );
}
