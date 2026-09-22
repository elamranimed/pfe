'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface OfficeDetailsModalProps {
  office: Office | null;
  userRole: 'admin' | 'responsable';
  onOpenChange: (open: boolean) => void;
}

const clean = (v?: string | null) => {
  const t = v?.trim();
  return t && t.length > 0 ? t : null;
};

const STATUS: Record<string, { label: string; className: string }> = {
  available:   { label: 'Disponible',  className: 'bg-green-100 text-green-700' },
  occupied:    { label: 'Occupé',      className: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-700' },
};

const TYPES: Record<string, string> = {
  individual:     'Bureau Individuel',
  'open-space':   'Open-Space',
  'meeting-room': 'Salle de Réunion',
};

function row(label: string, value: React.ReactNode, alwaysShow = false, isResponsable = false) {
  if (!alwaysShow && (value === null || value === undefined || value === '')) return null;
  return (
    <div>
      <p className={`text-sm mb-1 ${isResponsable ? 'text-muted-foreground' : 'text-slate-600'}`}>{label}</p>
      <div className={`font-semibold ${isResponsable ? 'text-foreground' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

function rowFull(label: string, value: React.ReactNode, isResponsable = false) {
  if (!value) return null;
  return (
    <div className="col-span-2">
      <p className={`text-sm mb-1 ${isResponsable ? 'text-muted-foreground' : 'text-slate-600'}`}>{label}</p>
      <div className={`font-semibold ${isResponsable ? 'text-foreground' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

export function OfficeDetailsModal({ office, userRole, onOpenChange }: OfficeDetailsModalProps) {
  if (!office) return null;

  const { tenant } = office;
  const name  = clean(office.name);
  const phone = clean(tenant?.phone) || clean((office as any).telephone);
  const email = clean(tenant?.email) || clean((office as any).email);
  const status = STATUS[office.status] ?? { label: office.status, className: 'bg-slate-100 text-slate-700' };
  const isResponsable = userRole === 'responsable';

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails {name || `Bureau ${office.number}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className={`text-lg font-semibold mb-4 ${isResponsable ? 'text-foreground' : 'text-slate-900'}`}>Informations Bureau</h3>
            <div className="grid grid-cols-2 gap-4">
              {row('Numéro', isResponsable ? office.number || '-' : office.number, false, isResponsable)}
              {row('Nom du Bureau', isResponsable ? name || '-' : name, true, isResponsable)}
              {row('Étage', isResponsable ? office.floor ?? '-' : office.floor, false, isResponsable)}
              {row('Type', TYPES[office.type] ?? office.type, false, isResponsable)}
              {row('Téléphone', isResponsable ? (phone ? <a href={`tel:${phone}`} className="underline">{phone}</a> : '-') : (phone && <a href={`tel:${phone}`} className="underline">{phone}</a>), false, isResponsable)}
              {row('Email', isResponsable ? (email ? <a href={`mailto:${email}`} className="underline">{email}</a> : '-') : (email && <a href={`mailto:${email}`} className="underline">{email}</a>), false, isResponsable)}
              {row('Cotisation Mensuelle', formatCurrency(office.cotisation), false, isResponsable)}
              {row('Statut', <Badge className={status.className}>{status.label}</Badge>, false, isResponsable)}
              {rowFull('Notes', office.notes && <span className="whitespace-pre-wrap">{office.notes}</span>, isResponsable)}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className={`text-lg font-semibold mb-4 ${isResponsable ? 'text-foreground' : 'text-slate-900'}`}>Informations Locataire</h3>
            {tenant ? (
              <div className="grid grid-cols-2 gap-4">
                {row('Entreprise',    clean(tenant.companyName), false, isResponsable)}
                {row('Contact',       clean(tenant.contactName), false, isResponsable)}
                {row('Début Contrat', clean(tenant.contractStart), false, isResponsable)}
                {row('Fin Contrat',   clean(tenant.contractEnd), false, isResponsable)}
              </div>
            ) : (
              <p className="text-slate-500 italic">Aucun locataire associé à ce bureau.</p>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OfficeDetailsModal;