'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import { Payment, Office } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentModal } from './payment-modal';

type PaymentPayload = {
  id?: string;
  bureauId: string;
  amount: number;
  date: string;
  etat: 'paye' | 'en_cours' | 'impaye';
};

interface PaymentsTableProps {
  payments: Payment[];
  offices: Office[];
  loadingOffices?: boolean;
  onAddPayment?: (payload: PaymentPayload) => Promise<void>;
  onUpdatePayment?: (payload: PaymentPayload) => Promise<void>;
  onDeletePayment?: (id: string) => Promise<void>;
  userRole: 'admin' | 'responsable'; // 👈 ajout
}

export function PaymentsTable({
  payments,
  offices,
  loadingOffices,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  userRole,
}: PaymentsTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingPayment, setEditingPayment] = useState<PaymentPayload | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const getPaymentTypeBadge = (type: string | undefined) => {
    const types: Record<string, { label: string; variant: any }> = {
      individual: { label: 'Individuel', variant: 'default' },
      'open-space': { label: 'Open-Space', variant: 'secondary' },
      'meeting-room': { label: 'Salle réunion', variant: 'outline' },
      centre: { label: 'Centre', variant: 'secondary' },
    };
    return types[type || ''] || { label: type || '—', variant: 'default' };
  };

  const getEtatBadge = (etat?: string) => {
    if (etat === 'paye') return <Badge className="bg-green-100 text-green-700">Payé</Badge>;
    if (etat === 'impaye') return <Badge className="bg-red-100 text-red-700">Impayé</Badge>;
    return <Badge className="bg-orange-100 text-orange-700">En cours</Badge>;
  };

  const openAdd = () => {
    setModalMode('add');
    setEditingPayment(undefined);
    setShowModal(true);
  };

  const openEdit = (p: Payment) => {
    const bureauId = p.officeId || offices.find(o => o.number === p.officeNumber)?.id || '';
    setEditingPayment({
      id: p.id,
      bureauId,
      amount: p.amount,
      date: p.date,
      etat: p.etat || 'en_cours',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openView = (p: Payment) => {
    const bureauId = p.officeId || offices.find(o => o.number === p.officeNumber)?.id || '';
    setEditingPayment({
      id: p.id,
      bureauId,
      amount: p.amount,
      date: p.date,
      etat: p.etat || 'en_cours',
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleSave = async (payload: PaymentPayload) => {
    if (!onAddPayment || !onUpdatePayment) return;
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await onAddPayment(payload);
      } else {
        await onUpdatePayment(payload);
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Payment) => {
    if (!onDeletePayment) return;
    if (!p.id) return;
    if (!confirm('Supprimer ce paiement ?')) return;
    await onDeletePayment(p.id);
  };

  return (
    <div>
      {/* Bouton Enregistrer Paiement visible uniquement pour admin */}
      {userRole === 'admin' && (
        <div className="mb-4">
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Enregistrer Paiement
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bureau N°</TableHead>
              <TableHead>Locataire</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  Aucun paiement pour cette période
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const office =
                  offices.find(
                    (o) =>
                      o.id === payment.officeId ||
                      o.number === payment.officeNumber
                  );

                const bureauNumber = office?.number ?? payment.officeNumber;
                const tenantDisplay =
                  office?.name ||
                  office?.tenant?.companyName ||
                  payment.tenantName ||
                  '—';

                const typeSource = office?.type || payment.type;
                const typeBadge = getPaymentTypeBadge(typeSource);

                return (
                  <TableRow key={payment.id || payment.reference || payment.date + payment.amount}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="font-medium">{bureauNumber}</TableCell>
                    <TableCell>{tenantDisplay}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadge.variant as any}>
                        {typeBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{getEtatBadge(payment.etat || payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Voir toujours visible */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Voir"
                          className="text-slate-600"
                          onClick={() => openView(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Modifier et Supprimer visibles uniquement pour admin */}
                        {userRole === 'admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Modifier"
                              className="text-slate-600"
                              onClick={() => openEdit(payment)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(payment)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
        offices={offices}
        loadingOffices={loadingOffices}
        submitting={submitting}
        mode={modalMode}
        payment={editingPayment}
        onSave={handleSave}
      />
    </div>
  );
}
