'use client';

import { useState, useMemo } from 'react';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export interface UnpaidOffice {
  office: Office;
  moisImpayes: number;
  montantMoisEnCours: number;
  montantCumul: number;
}

interface RecouvrementTableProps {
  unpaidOffices: UnpaidOffice[];
  loading: boolean;
  sendingEmails: Set<string>;
  sentEmails: Set<string>;
  onSendRelance: (office: Office, montantCumul: number, moisImpayes: number) => void;
}

export function RecouvrementTable({ 
  unpaidOffices, 
  loading,
  sendingEmails,
  sentEmails,
  onSendRelance
}: RecouvrementTableProps) {
  const columns: ColumnDef<UnpaidOffice>[] = useMemo(() => [
    {
      accessorFn: (row) => row.office.number,
      id: 'officeNumber',
      header: 'Bureau',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          #{row.original.office.number}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.office.name,
      id: 'officeName',
      header: 'Locataire',
      cell: ({ row }) => <span className="text-foreground">{row.original.office.name || '—'}</span>,
    },
    {
      accessorFn: (row) => row.office.type,
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.office.type === 'individual' ? 'Individuel' : row.original.office.type === 'open-space' ? 'Open Space' : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'moisImpayes',
      header: 'Mois impayés',
      cell: ({ row }) => <span className="text-foreground font-medium">{row.original.moisImpayes} mois</span>,
    },
    {
      accessorKey: 'montantMoisEnCours',
      header: 'Mois en cours',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.original.montantMoisEnCours)}
        </span>
      ),
    },
    {
      accessorKey: 'montantCumul',
      header: 'Cumul total',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.original.montantCumul)}
        </span>
      ),
    },
    {
      id: 'statut',
      header: 'Statut',
      cell: () => (
        <Badge variant="destructive">
          Impayé
        </Badge>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const { office, montantCumul, moisImpayes } = row.original;
        const isSending = sendingEmails.has(office.id);
        const isSent = sentEmails.has(office.id);

        return (
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => onSendRelance(office, montantCumul, moisImpayes)}
            disabled={!office.email || isSending}
            title={!office.email ? 'Aucun email enregistré' : `Envoyer à ${office.email}`}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSent ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {isSending ? 'Envoi...' : isSent ? 'Envoyé' : 'Relancer'}
          </Button>
        );
      },
    },
  ], [sendingEmails, sentEmails]);

  if (loading) {
    return <p className="text-muted-foreground py-6 text-center">Chargement...</p>;
  }

  if (unpaidOffices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-3 text-emerald-500" />
        <p className="text-lg font-medium text-foreground">Aucun impayé</p>
        <p className="text-sm text-muted-foreground mt-1">Tous les bureaux sont à jour 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={unpaidOffices}
        searchKey="officeNumber"
        searchPlaceholder="Rechercher par N° Bureau..."
      />
    </div>
  );
}