'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense } from '@/lib/types';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Expense) => void;
}

export function ExpenseModal({
  open,
  onOpenChange,
  onSave,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<Omit<Expense, 'createdAt'>>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    category: 'maintenance',
    description: '',
    amount: 0,
    supplier: '',
    status: 'pending',
  });

  const handleSave = () => {
    if (!formData.description) {
      alert('Veuillez entrer une description');
      return;
    }
    if (!formData.amount) {
      alert('Veuillez entrer le montant');
      return;
    }

    onSave({
      ...formData,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    });

    setFormData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      category: 'maintenance',
      description: '',
      amount: 0,
      supplier: '',
      status: 'pending',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter Dépense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Catégorie
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  category: value as 'salary' | 'electricity' | 'water' | 'maintenance' | 'insurance',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salaire</SelectItem>
                <SelectItem value="electricity">Électricité</SelectItem>
                <SelectItem value="water">Eau</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="insurance">Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Facture électricité février"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fournisseur
            </label>
            <Input
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              placeholder="Ex: ONEE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Montant (MAD)
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              placeholder="4200"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Statut
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'paid' | 'pending',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="pending">En Attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
