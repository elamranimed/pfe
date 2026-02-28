'use client';

import React, { useEffect, useState } from 'react';
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

type BureauOption = { id: string; number: string; name?: string; type?: string };
type PaymentPayload = {
  id?: string;
  bureauId: string;
  amount: number;
  date: string;
  etat: 'paye' | 'en_cours' | 'impaye';
};

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offices: BureauOption[];
  loadingOffices?: boolean;
  submitting?: boolean;
  mode?: 'add' | 'edit' | 'view';
  payment?: PaymentPayload;
  onSave: (payload: PaymentPayload) => Promise<void>;
}

export function PaymentModal({
  open,
  onOpenChange,
  offices,
  loadingOffices,
  submitting,
  mode = 'add',
  payment,
  onSave,
}: PaymentModalProps) {
  const [formData, setFormData] = useState<PaymentPayload>({
    bureauId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    etat: 'en_cours',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        id: payment?.id,
        bureauId: payment?.bureauId ?? '',
        amount: payment?.amount ?? 0,
        date: payment?.date ?? new Date().toISOString().split('T')[0],
        etat: payment?.etat ?? 'en_cours',
      });
    }
  }, [open, payment]);

  const handleSave = async () => {
    if (mode === 'view') {
      onOpenChange(false);
      return;
    }
    if (!formData.bureauId) {
      alert('Veuillez sélectionner un bureau');
      return;
    }
    if (!formData.amount) {
      alert('Veuillez entrer le montant');
      return;
    }

    await onSave({
      id: formData.id,
      bureauId: formData.bureauId,
      amount: formData.amount,
      date: formData.date,
      etat: formData.etat,
    });

    setFormData({
      bureauId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      etat: 'en_cours',
    });
  };

  const disabled = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit'
              ? 'Modifier le paiement'
              : mode === 'view'
              ? 'Détail du paiement'
              : 'Enregistrer Paiement'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bureau
            </label>
            <Select
              value={formData.bureauId}
              onValueChange={(value) => setFormData({ ...formData, bureauId: value })}
              disabled={loadingOffices || disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingOffices ? 'Chargement...' : 'Sélectionner un bureau'} />
              </SelectTrigger>
              <SelectContent>
                {offices.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    Aucun bureau disponible
                  </SelectItem>
                ) : (
                  offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      Bureau {office.number}
                      {office.name ? ` — ${office.name}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Montant (MAD)
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              min="0"
              placeholder="9200"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              État
            </label>
            <Select
              value={formData.etat}
              onValueChange={(value) =>
                setFormData({ ...formData, etat: value as 'paye' | 'en_cours' | 'impaye' })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="impaye">Impayé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              {mode === 'view'
                ? 'Fermer'
                : submitting
                  ? 'Enregistrement…'
                  : mode === 'edit'
                    ? 'Mettre à jour'
                    : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
