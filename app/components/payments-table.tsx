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
import { Payment } from '@/app/lib/types';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import { PaymentModal } from './payment-modal';

interface PaymentsTableProps {
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
}

export function PaymentsTable({
  payments,
  onAddPayment,
}: PaymentsTableProps) {
  const [showModal, setShowModal] = useState(false);

  const getPaymentTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      rent: { label: 'Loyer', variant: 'default' },
      charges: { label: 'Charges', variant: 'secondary' },
      penalty: { label: 'Pénalité', variant: 'destructive' },
    };
    return types[type] || { label: type, variant: 'default' };
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-700">Payé</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-700">En Attente</Badge>;
  };

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Enregistrer Paiement
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-700">Date</TableHead>
              <TableHead className="text-slate-700">Bureau N°</TableHead>
              <TableHead className="text-slate-700">Locataire</TableHead>
              <TableHead className="text-slate-700">Type</TableHead>
              <TableHead className="text-slate-700">Montant</TableHead>
              <TableHead className="text-slate-700">Référence</TableHead>
              <TableHead className="text-slate-700">Statut</TableHead>
              <TableHead className="text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  Aucun paiement pour cette période
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const typeBadge = getPaymentTypeBadge(payment.type);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="font-medium">
                      {payment.officeNumber}
                    </TableCell>
                    <TableCell>{payment.tenantName}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadge.variant as any}>
                        {typeBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {payment.reference}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentModal
        open={showModal}
        onOpenChange={setShowModal}
        onSave={(payment) => {
          onAddPayment(payment);
          setShowModal(false);
        }}
      />
    </div>
  );
}
