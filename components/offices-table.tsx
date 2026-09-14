'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { OfficeDetailsModal } from './office-details-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface OfficesTableProps {
  offices: Office[];
  onAddOffice: (office: Office) => void;
  onUpdateOffice: (office: Office) => void;
  onDeleteOffice?: (officeId: string) => void;
  onEditOffice: (office: Office) => void;
  userRole: 'admin' | 'responsable';
}

function cleanString(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^[-\s]+$/.test(trimmed)) return null;
  return trimmed;
}

export function OfficesTable({
  offices,
  onAddOffice,
  onUpdateOffice,
  onDeleteOffice,
  onEditOffice,
  userRole,
}: OfficesTableProps) {
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [deletingOffice, setDeletingOffice] = useState<Office | null>(null);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: any }> = {
      available: { label: 'Disponible', variant: 'success' },
      occupied: { label: 'Occupé', variant: 'default' },
      maintenance: { label: 'Maintenance', variant: 'warning' },
    };
    const s = statuses[status] || { label: status, variant: 'secondary' };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      individual: 'Bureau Individuel',
      'open-space': 'Open-Space',
      'meeting-room': 'Salle de Réunion',
      centre: 'Centre',
    };
    return types[type] || type;
  };

  const handleDelete = () => {
    if (deletingOffice && onDeleteOffice) {
      onDeleteOffice(deletingOffice.id);
      setDeletingOffice(null);
    }
  };

  const resolvePhone = (office: Office) => {
    const rootPhone = (office as any).telephone ?? '';
    if (rootPhone && String(rootPhone).trim() !== '') return String(rootPhone).trim();

    const tenantPhone = office.tenant?.phone ?? '';
    if (tenantPhone && String(tenantPhone).trim() !== '') return String(tenantPhone).trim();

    const tenantTelephone = (office.tenant as any)?.telephone ?? '';
    return tenantTelephone && String(tenantTelephone).trim() !== '' ? String(tenantTelephone).trim() : '';
  };

  const resolveEmail = (office: Office) => {
    const rootEmail = (office as any).email ?? '';
    if (rootEmail && String(rootEmail).trim() !== '') return String(rootEmail).trim();

    const tenantEmail = office.tenant?.email ?? '';
    if (tenantEmail && String(tenantEmail).trim() !== '') return String(tenantEmail).trim();

    const tenantMail = (office.tenant as any)?.mail ?? '';
    return tenantMail && String(tenantMail).trim() !== '' ? String(tenantMail).trim() : '';
  };

  const columns: ColumnDef<Office>[] = useMemo(() => [
    {
      accessorFn: (row) => `#${row.number}`,
      id: 'number',
      header: 'N° Bureau',
      cell: ({ row }) => <span className="font-bold">#{row.original.number}</span>,
    },
    {
      id: 'locataire',
      header: 'Locataire (Nom du Bureau)',
      cell: ({ row }) => {
        const displayName =
          cleanString(row.original.tenant?.companyName) ||
          cleanString(row.original.name) ||
          null;
        return displayName ?? <span className="italic">—</span>;
      },
    },
    {
      accessorKey: 'floor',
      header: 'Étage',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      id: 'telephone',
      header: 'Téléphone',
      cell: ({ row }) => {
        const phone = resolvePhone(row.original);
        return phone ? <a href={`tel:${phone}`}>{phone}</a> : '—';
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = resolveEmail(row.original);
        return email ? <a href={`mailto:${email}`}>{email}</a> : '—';
      },
    },
    {
      accessorKey: 'cotisation',
      header: 'Cotisation',
      cell: ({ row }) => formatCurrency(row.original.cotisation),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const office = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedOffice(office)}
              title="Afficher"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {userRole === 'admin' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditOffice(office)}
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingOffice(office)}
                  title="Supprimer"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ], [userRole]);

  return (
    <div>
      <DataTable
        columns={columns}
        data={offices}
        searchKey="number"
        searchPlaceholder="Rechercher par N° Bureau..."
      />

      <OfficeDetailsModal
        office={selectedOffice}
        onOpenChange={(open) => {
          if (!open) setSelectedOffice(null);
        }}
      />

      <AlertDialog open={!!deletingOffice} onOpenChange={(open) => !open && setDeletingOffice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le bureau <strong>{deletingOffice?.number}</strong> ?
              {deletingOffice?.tenant && (
                <span className="block mt-2 text-orange-600">
                  ⚠️ Ce bureau est actuellement occupé par {deletingOffice.tenant.companyName}.
                </span>
              )}
              <span className="block mt-2">Cette action est irréversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
