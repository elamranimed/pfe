'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import { Payment, Office } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentModal } from './payment-modal';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

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
  userRole: 'admin' | 'responsable';
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
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const getPaymentTypeBadge = (type: string | undefined) => {
    const types: Record<string, { label: string; variant: any }> = {
      individual: { label: 'Individuel', variant: 'default' },
      'open-space': { label: 'Open-Space', variant: 'secondary' },
      'meeting-room': { label: 'Salle réunion', variant: 'outline' },
      centre: { label: 'Centre', variant: 'secondary' },
    };
    const t = types[type || ''] || { label: type || '—', variant: 'default' };
    return <Badge variant={t.variant}>{t.label}</Badge>;
  };

  const getEtatBadge = (etat?: string) => {
    if (etat === 'paye') return <Badge variant="success">Payé</Badge>;
    if (etat === 'impaye') return <Badge variant="destructive">Impayé</Badge>;
    return <Badge variant="warning">En cours</Badge>;
  };

  const openAdd = () => {
    setModalMode('add');
    setEditingPayment(undefined);
    setShowModal(true);
  };

  const openEdit = (p: Payment) => {
    if (userRole !== 'admin') {
      setPermissionMessage('Modification interdite : cette opération est réservée à l’administrateur.');
      return;
    }

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

  const columns: ColumnDef<Payment>[] = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'officeNumber',
      header: 'Bureau N°',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.officeNumber ? `B${row.original.officeNumber}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'tenantName',
      header: 'Locataire',
      cell: ({ row }) => row.original.tenantName || '—',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => getPaymentTypeBadge(row.original.type),
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'etat',
      header: 'État',
      cell: ({ row }) => getEtatBadge(row.original.etat),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openView(p)}
              title="Afficher"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(p)}
              title={userRole === 'admin' ? 'Modifier' : 'Modification réservée à l’administrateur'}
              aria-label={userRole === 'admin' ? 'Modifier' : 'Modification réservée à l’administrateur'}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            {userRole === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p)}
                  title="Supprimer"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
            )}
          </div>
        );
      },
    },
  ], [userRole, offices]);

  return (
    <div>
      {permissionMessage && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {permissionMessage}
        </div>
      )}

      {userRole === 'admin' && (
        <div className="mb-4">
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Enregistrer Paiement
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={payments}
        searchKey="officeNumber"
        searchPlaceholder="Rechercher par N° Bureau..."
      />

      <PaymentModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={modalMode}
        payment={editingPayment}
        offices={offices}
        loadingOffices={loadingOffices}
        onSave={handleSave}
        submitting={submitting}
      />
    </div>
  );
}
