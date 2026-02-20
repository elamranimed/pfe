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
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { OfficeModal } from './office-modal';
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

interface OfficesTableProps {
  offices: Office[];
  onAddOffice: (office: Office) => void;
  onUpdateOffice: (office: Office) => void;
  onDeleteOffice?: (officeId: string) => void;
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
}: OfficesTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [deletingOffice, setDeletingOffice] = useState<Office | null>(null);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string }> = {
      available: { label: 'Disponible', className: 'bg-green-100 text-green-700' },
      occupied: { label: 'Occupé', className: 'bg-blue-100 text-blue-700' },
      maintenance: { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-700' },
    };
    const s = statuses[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
    return <Badge className={s.className}>{s.label}</Badge>;
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

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => {
            setEditingOffice(null);
            setShowAddModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter Bureau
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-700">N° Bureau</TableHead>
              <TableHead className="text-slate-700">Locataire (Nom du Bureau)</TableHead>
              <TableHead className="text-slate-700">Étage</TableHead>
              <TableHead className="text-slate-700">Type</TableHead>
              <TableHead className="text-slate-700">Téléphone</TableHead>
              <TableHead className="text-slate-700">Email</TableHead>
              <TableHead className="text-slate-700">Cotisation</TableHead>
              <TableHead className="text-slate-700">Statut</TableHead>
              <TableHead className="text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {offices.map((office) => {
              const phone = resolvePhone(office);
              const email = resolveEmail(office);

              
              const displayName =
                cleanString(office.tenant?.companyName) ||
                cleanString(office.name) ||
                null;

              return (
                <TableRow key={office.id}>
                  <TableCell className="font-bold text-slate-900">{office.number}</TableCell>

                  <TableCell className="text-slate-700">
                    {displayName ?? <span className="text-slate-400 italic">—</span>}
                  </TableCell>

                  <TableCell>{office.floor}</TableCell>
                  <TableCell>{getTypeBadge(office.type)}</TableCell>

                  <TableCell className="text-slate-700">
                    {phone ? <a href={`tel:${phone}`} className="underline">{phone}</a> : '—'}
                  </TableCell>

                  <TableCell className="text-slate-700">
                    {email ? <a href={`mailto:${email}`} className="underline">{email}</a> : '—'}
                  </TableCell>

                  <TableCell className="font-medium">{formatCurrency(office.cotisation)}</TableCell>
                  <TableCell>{getStatusBadge(office.status)}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOffice(office)}
                        title="Afficher"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingOffice(office);
                          setShowAddModal(true);
                        }}
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
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OfficeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        office={editingOffice}
        onSave={(office) => {
          if (editingOffice) {
            onUpdateOffice(office);
          } else {
            onAddOffice(office);
          }
          setShowAddModal(false);
          setEditingOffice(null);
        }}
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