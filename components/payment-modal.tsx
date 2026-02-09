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
import { Payment } from '@/lib/types';
import { mockOffices } from '@/lib/mock-data';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payment: Payment) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  onSave,
}: PaymentModalProps) {
  const [formData, setFormData] = useState<Omit<Payment, 'createdAt'>>({
    id: '',
    officeId: '',
    officeNumber: '',
    tenantName: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'rent',
    reference: '',
    status: 'pending',
  });

  const occupiedOffices = mockOffices.filter((o) => o.tenant);

  const handleOfficeChange = (officeId: string) => {
    const office = mockOffices.find((o) => o.id === officeId);
    if (office) {
      setFormData({
        ...formData,
        officeId,
        officeNumber: office.number,
        tenantName: office.tenant?.companyName || '',
      });
    }
  };

  const handleSave = () => {
    if (!formData.officeId) {
      alert('Veuillez sélectionner un bureau');
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
      officeId: '',
      officeNumber: '',
      tenantName: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'rent',
      reference: '',
      status: 'pending',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enregistrer Paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bureau (Locataire)
            </label>
            <Select value={formData.officeId} onValueChange={handleOfficeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un bureau" />
              </SelectTrigger>
              <SelectContent>
                {occupiedOffices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    Bureau {office.number} - {office.tenant?.companyName}
                  </SelectItem>
                ))}
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
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              placeholder="9200"
              min="0"
            />
          </div>

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
              Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as 'rent' | 'charges' | 'penalty',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Loyer</SelectItem>
                <SelectItem value="charges">Charges</SelectItem>
                <SelectItem value="penalty">Pénalité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Référence
            </label>
            <Input
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="PAY-2024-001"
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
                <SelectItem value="paid">Payé</SelectItem>
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
