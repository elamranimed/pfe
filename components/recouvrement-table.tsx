'use client';

import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Mail } from 'lucide-react';

export interface UnpaidOffice {
  office: Office;
  moisImpayes: number;
  montantMoisEnCours: number;
  montantCumul: number;
}

interface RecouvrementTableProps {
  unpaidOffices: UnpaidOffice[];
  loading: boolean;
}

export function RecouvrementTable({ unpaidOffices, loading }: RecouvrementTableProps) {
  if (loading) {
    return <p className="text-slate-500 py-6 text-center">Chargement...</p>;
  }

  if (unpaidOffices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-3 text-green-400" />
        <p className="text-lg font-medium text-slate-600">Aucun impayé</p>
        <p className="text-sm text-slate-400 mt-1">Tous les bureaux sont à jour 🎉</p>
      </div>
    );
  }

  const sendRelance = (office: Office, montantCumul: number, moisImpayes: number) => {
    const email = office.email || '';
    const subject = encodeURIComponent(`Relance paiement — Bureau ${office.number}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nNous vous contactons concernant le bureau n°${office.number}.\n\n` +
      `Vous avez ${moisImpayes} mois impayé(s) pour un montant total de ${formatCurrency(montantCumul)}.\n\n` +
      `Merci de régulariser votre situation dans les plus brefs délais.\n\nCordialement,\nLa direction`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-red-50">
            <TableHead className="text-red-700 font-semibold">Bureau</TableHead>
            <TableHead className="text-red-700 font-semibold">Locataire</TableHead>
            <TableHead className="text-red-700 font-semibold">Type</TableHead>
            <TableHead className="text-red-700 font-semibold">Mois impayés</TableHead>
            <TableHead className="text-red-700 font-semibold">Mois en cours</TableHead>
            <TableHead className="text-red-700 font-semibold">Cumul total</TableHead>
            <TableHead className="text-red-700 font-semibold">Statut</TableHead>
            <TableHead className="text-red-700 font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unpaidOffices.map(({ office, moisImpayes, montantMoisEnCours, montantCumul }) => (
            <TableRow key={office.id} className="hover:bg-red-50/50 transition-colors">
              <TableCell className="font-semibold text-slate-800">
                #{office.number}
              </TableCell>
              <TableCell className="text-slate-700">
                {office.name || '—'}
              </TableCell>
              <TableCell className="text-slate-600">
                {office.type === 'individual' ? 'Individuel' : office.type === 'open-space' ? 'Open Space' : '—'}
              </TableCell>
              <TableCell className="text-slate-700 font-medium">
                {moisImpayes} mois
              </TableCell>
              <TableCell className="font-bold text-orange-600">
                {formatCurrency(montantMoisEnCours)}
              </TableCell>
              <TableCell className="font-bold text-red-600">
                {formatCurrency(montantCumul)}
              </TableCell>
              <TableCell>
                <Badge className="bg-red-100 text-red-700 border border-red-200">
                  Impayé
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => sendRelance(office, montantCumul, moisImpayes)}
                  disabled={!office.email}
                  title={!office.email ? 'Aucun email enregistré' : `Envoyer à ${office.email}`}
                >
                  <Mail className="w-4 h-4" />
                  Relancer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}