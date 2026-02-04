import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { Expense } from '@/types';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  onSave: (expense: Expense) => void;
}

const categories = [
  'salary', 'electricity', 'water', 'maintenance', 'insurance', 'cleaning', 'security'
];

const categoryLabels: Record<string, string> = {
  salary: 'Salaire',
  electricity: 'Électricité',
  water: 'Eau',
  maintenance: 'Maintenance',
  insurance: 'Assurance',
  cleaning: 'Nettoyage',
  security: 'Sécurité'
};

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: ExpenseDialogProps) {
  const [formData, setFormData] = useState<Partial<Expense>>(
    expense || {
      date: new Date().toISOString().split('T')[0],
      category: 'maintenance',
      description: '',
      supplier: '',
      amount: 0,
      status: 'paid',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: expense?.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
    } as Expense);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Modifier la dépense' : 'Enregistrer une dépense'}</DialogTitle>
          <DialogDescription>
            Saisissez les détails de la dépense.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v: any) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Input 
              id="supplier" 
              value={formData.supplier} 
              onChange={e => setFormData({ ...formData, supplier: e.target.value })} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (MAD)</Label>
              <Input 
                id="amount" 
                type="number"
                value={formData.amount} 
                onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: any) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
