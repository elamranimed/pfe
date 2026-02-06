import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';

export function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter(e => {
    if (filter === 'all') return true;
    const now = new Date();
    const d = new Date(e.date);
    if (filter === '30') return (now.getTime() - d.getTime()) <= (30 * 24 * 60 * 60 * 1000);
    if (filter === '90') return (now.getTime() - d.getTime()) <= (90 * 24 * 60 * 60 * 1000);
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = filteredExpenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = () => {
    setCurrentExpense(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsDialogOpen(true);
  };

  const handleSave = (expense: Expense) => {
    if (currentExpense) {
      updateExpense(expense.id, expense);
    } else {
      addExpense(expense);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dépenses</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une dépense
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-64">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Derniers 30 jours</SelectItem>
              <SelectItem value="90">Derniers 3 mois</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="py-4 flex items-center justify-between space-x-4">
            <span className="text-sm text-muted-foreground font-medium">Total dépenses:</span>
            <span className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{expense.supplier}</TableCell>
                <TableCell className="font-bold">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>
                  <Badge 
                    className={expense.status === 'paid' ? "bg-green-600" : "bg-yellow-500"}
                  >
                    {expense.status === 'paid' ? 'Payé' : 'En attente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(expense)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        expense={currentExpense}
        onSave={handleSave}
      />
    </div>
  );
}
