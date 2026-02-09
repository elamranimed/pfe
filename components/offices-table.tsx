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
import { Plus, Edit2, Eye } from 'lucide-react';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { OfficeModal } from './office-modal';
import { OfficeDetailsModal } from './office-details-modal';

interface OfficesTableProps {
  offices: Office[];
  onAddOffice: (office: Office) => void;
  onUpdateOffice: (office: Office) => void;
}

export function OfficesTable({
  offices,
  onAddOffice,
  onUpdateOffice,
}: OfficesTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string }> = {
      available: { label: 'Disponible', className: 'bg-green-100 text-green-700' },
      occupied: { label: 'Occupé', className: 'bg-blue-100 text-blue-700' },
      maintenance: {
        label: 'Maintenance',
        className: 'bg-yellow-100 text-yellow-700',
      },
    };
    const s = statuses[status];
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      individual: 'Bureau Individuel',
      'open-space': 'Open-Space',
      'meeting-room': 'Salle de Réunion',
    };
    return types[type] || type;
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
              <TableHead className="text-slate-700">Étage</TableHead>
              <TableHead className="text-slate-700">Type</TableHead>
              <TableHead className="text-slate-700">Surface (m²)</TableHead>
              <TableHead className="text-slate-700">Loyer</TableHead>
              <TableHead className="text-slate-700">Statut</TableHead>
              <TableHead className="text-slate-700">Locataire</TableHead>
              <TableHead className="text-slate-700">Contact</TableHead>
              <TableHead className="text-slate-700">Fin Contrat</TableHead>
              <TableHead className="text-slate-700">Solde</TableHead>
              <TableHead className="text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offices.map((office) => (
              <TableRow key={office.id}>
                <TableCell className="font-bold text-slate-900">
                  {office.number}
                </TableCell>
                <TableCell>{office.floor}</TableCell>
                <TableCell>{getTypeBadge(office.type)}</TableCell>
                <TableCell>{office.surface}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(office.monthlyRent)}
                </TableCell>
                <TableCell>{getStatusBadge(office.status)}</TableCell>
                <TableCell className="text-slate-700">
                  {office.tenant?.companyName || '—'}
                </TableCell>
                <TableCell className="text-slate-700">
                  {office.tenant?.contactName || '—'}
                </TableCell>
                <TableCell className="text-slate-700">
                  {office.tenant?.contractEnd || '—'}
                </TableCell>
                <TableCell>
                  {office.tenant?.balance ? (
                    <span
                      className={
                        office.tenant.balance < 0
                          ? 'font-semibold text-red-600'
                          : 'font-semibold text-green-600'
                      }
                    >
                      {formatCurrency(office.tenant.balance)}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
                    {office.tenant && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOffice(office)}
                        title="Voir Détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
