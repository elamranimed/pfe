'use client';

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
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Bureau, Statut, Type } from '@prisma/client';

interface BureauTableProps {
  bureaux: Bureau[];
}

export function BureauTable({ bureaux }: BureauTableProps) {
  const getStatusBadge = (status: Statut) => {
    const statuses: Record<Statut, { label: string; className: string }> = {
      actif: { label: 'Actif', className: 'bg-green-100 text-green-700' },
      inactif: { label: 'Inactif', className: 'bg-red-100 text-red-700' },
    };
    const s = statuses[status];
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getTypeLabel = (type: Type) => {
    const types: Record<Type, string> = {
      individuel: 'Individuel',
      centre: 'Centre',
    };
    return types[type] || type;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-slate-700">ID</TableHead>
            <TableHead className="text-slate-700">Nom</TableHead>
            <TableHead className="text-slate-700">Étage</TableHead>
            <TableHead className="text-slate-700">Téléphone</TableHead>
            <TableHead className="text-slate-700">Email</TableHead>
            <TableHead className="text-slate-700">Type</TableHead>
            <TableHead className="text-slate-700">Statut</TableHead>
            <TableHead className="text-slate-700">Cotisation</TableHead>
            <TableHead className="text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bureaux.map((bureau) => (
            <TableRow key={bureau.id_bureau}>
              <TableCell className="font-bold text-slate-900">
                {bureau.id_bureau}
              </TableCell>
              <TableCell>{bureau.nom}</TableCell>
              <TableCell>{bureau.etage}</TableCell>
              <TableCell>{bureau.telephone || 'N/A'}</TableCell>
              <TableCell>{bureau.email || 'N/A'}</TableCell>
              <TableCell>{getTypeLabel(bureau.type)}</TableCell>
              <TableCell>{getStatusBadge(bureau.statut)}</TableCell>
              <TableCell>{bureau.cotisation}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => setSelectedBureau(bureau)}
                    title="Voir Détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => setEditingBureau(bureau)}
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => setDeletingBureau(bureau)}
                    title="Supprimer"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
