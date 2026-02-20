'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Office } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockPayments } from '@/lib/mock-data';

interface OfficeDetailsModalProps {
  office: Office | null;
  onOpenChange: (open: boolean) => void;
}

export function OfficeDetailsModal({
  office,
  onOpenChange,
}: OfficeDetailsModalProps) {
  if (!office) return null;

  const tenant = office.tenant;
  const hasTenant = !!tenant;
  const officePayments = mockPayments.filter((p) => p.officeId === office.id);

  return (
    <Dialog open={!!office} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Détails Bureau {office.number}
            {tenant ? ` - ${tenant.companyName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tenant Info */}
          {hasTenant ? (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Informations Locataire
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Entreprise</p>
                  <p className="font-semibold text-slate-900">{tenant?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Contact</p>
                  <p className="font-semibold text-slate-900">{tenant?.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="font-semibold text-slate-900">{tenant?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Téléphone</p>
                  <p className="font-semibold text-slate-900">{tenant?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Début Contrat</p>
                  <p className="font-semibold text-slate-900">
                    {tenant?.contractStart ? formatDate(tenant.contractStart) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Fin Contrat</p>
                  <p className="font-semibold text-slate-900">
                    {tenant?.contractEnd ? formatDate(tenant.contractEnd) : '—'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 mb-1">Solde Compte</p>
                  <p
                    className={
                      (tenant?.balance ?? 0) < 0
                        ? 'text-xl font-bold text-red-600'
                        : 'text-xl font-bold text-green-600'
                    }
                  >
                    {formatCurrency(tenant?.balance ?? 0)}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Informations Locataire</h3>
              <p className="text-slate-700">Aucun locataire associé à ce bureau.</p>
            </Card>
          )}

          {/* Office Info */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations Bureau</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Type</p>
                <p className="font-semibold text-slate-900">
                  {office.type === 'individual'
                    ? 'Bureau Individuel'
                    : office.type === 'open-space'
                      ? 'Open-Space'
                      : 'Salle de Réunion'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Surface</p>
                <p className="font-semibold text-slate-900">{office.surface} m²</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Loyer Mensuel</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(office.monthlyRent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Charges</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(office.charges)}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Historique Paiements</h3>
            {officePayments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-700">Date</TableHead>
                      <TableHead className="text-slate-700">Type</TableHead>
                      <TableHead className="text-slate-700">Montant</TableHead>
                      <TableHead className="text-slate-700">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officePayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          {payment.type === 'rent'
                            ? 'Loyer'
                            : payment.type === 'charges'
                              ? 'Charges'
                              : 'Pénalité'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'paid' ? (
                            <span className="text-green-600 font-semibold">Payé</span>
                          ) : (
                            <span className="text-orange-600 font-semibold">En Attente</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-slate-600">Aucun paiement enregistré</p>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
