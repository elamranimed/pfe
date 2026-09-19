'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Payment, Office } from '@/lib/types';
import * as XLSX from 'xlsx';
import { exportToXLSX, formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';

/* ─── Types & Constants ─── */
type PaymentStatus = 'paye' | 'non_paye';

interface MonthPayment {
  status: PaymentStatus;
  amount: number;
  paymentObj?: Payment;
}

interface BureauRow {
  id: string;
  numero: string;
  locataire: string;
  months: MonthPayment[];
}

const MONTHS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'];
const MONTHS_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const statusConfig: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paye:     { label: 'Payé',     bg: 'rgba(6,78,59,0.35)',   text: '#34d399', dot: '#34d399' },
  non_paye: { label: 'Non payé', bg: 'rgba(127,29,29,0.35)', text: '#f87171', dot: '#f87171' },
};

/* ─── Heat-map Cell (compact colored square + tooltip) ─── */
function HeatCell({ payment, monthLabel, onPay, onEdit }: { payment: MonthPayment; monthLabel: string; onPay: () => void; onEdit: () => void }) {
  const [showTip, setShowTip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isPaid = payment.status === 'paye';

  const handleClick = async () => {
    if (isProcessing) return;
    if (isPaid) {
      onEdit();
      return;
    }
    setIsProcessing(true);
    await onPay();
    setIsProcessing(false);
  };

  return (
    <div className="flex justify-center px-0.5 py-1">
      <div
        className="relative"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <div
          onClick={handleClick}
          className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-lg`}
          style={{
            background: isPaid
              ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            boxShadow: isPaid
              ? '0 2px 8px rgba(52,211,153,0.3)'
              : '0 2px 8px rgba(248,113,113,0.25)',
            opacity: isProcessing ? 0.5 : 1,
          }}
        >
          {isProcessing ? (
             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : isPaid ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        {/* Tooltip */}
        {showTip && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none"
            style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-[10px] text-slate-400 mb-0.5">{monthLabel}</p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isPaid ? '#34d399' : '#f87171' }}
              />
              <span className="text-xs font-semibold" style={{ color: isPaid ? '#34d399' : '#f87171' }}>
                {isPaid ? 'Payé (Clic pour modifier)' : 'Non payé (Clic pour payer)'}
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">
              {formatCurrency(payment.amount)}
            </p>
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px"
              style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1a1f2e' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Data mappers ─── */
const mapBureauToOffice = (b: any): Office => ({
  id: String(b.id_bureau),
  number: b.numero ? String(b.numero) : String(b.id_bureau),
  name: b.nom || '',
  floor: b.etage ?? 0,
  type: b.type === 'individuel' ? 'individual' : 'open-space',
  cotisation: b.cotisation ?? 0,
  status: b.statut === 'actif' ? 'occupied' : 'available',
  telephone: b.telephone || '',
  email: b.email || '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mapPaiementDto = (p: any, bureauMap: Record<string, Office>): Payment => {
  const bureauId = p.id_bureau ?? null;
  const bureau = bureauId ? bureauMap[String(bureauId)] : undefined;
  const isoDate = p.date ? new Date(p.date).toISOString() : new Date().toISOString();
  const etat = (p.etat as Payment['etat']) || 'en_cours';
  return {
    id: p.id_paiement ? String(p.id_paiement) : crypto.randomUUID(),
    officeId: bureau?.id ?? String(bureauId ?? ''),
    officeNumber: bureau?.number ?? '',
    tenantName: bureau?.name ?? '',
    amount: Number(p.montant ?? 0),
    date: isoDate.split('T')[0],
    type: bureau?.type,
    reference: `PAY-${p.id_paiement ?? Date.now()}`,
    etat,
    status: etat === 'paye' ? 'paid' : 'pending',
    createdAt: isoDate,
  };
};

export default function SuiviPaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<'tous' | PaymentStatus>('tous');
  const [bureauFilter, setBureauFilter] = useState('tous');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [pendingQuickPay, setPendingQuickPay] = useState<{officeId: string, monthIndex: number, existingPayment?: Payment} | null>(null);
  const [pendingEditPayment, setPendingEditPayment] = useState<Payment | null>(null);
  
  const { toast } = useToast();

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = 2030; y >= 2020; y--) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const resB = await fetch('/api/bureaux', { credentials: 'include', cache: 'no-store' });
      if (!resB.ok) throw new Error('Erreur chargement bureaux');
      const bureaux = await resB.json();
      const mappedB = bureaux.map(mapBureauToOffice);
      const bureauMap: Record<string, Office> = {};
      mappedB.forEach((b: Office) => { bureauMap[b.id] = b; });

      const resP = await fetch('/api/paiements', { credentials: 'include', cache: 'no-store' });
      if (!resP.ok) throw new Error('Erreur chargement paiements');
      const paiements = await resP.json();

      setOffices(mappedB);
      setPayments(paiements.map((p: any) => mapPaiementDto(p, bureauMap)));
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleQuickPay = async (officeId: string, monthIndex: number, existingPayment?: Payment) => {
    const office = offices.find(o => o.id === officeId);
    if (!office) return;
    
    try {
      if (existingPayment) {
        const res = await fetch('/api/paiements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: Number(existingPayment.id),
            data: {
              montant: existingPayment.amount,
              date: new Date(existingPayment.date).toISOString(),
              etat: 'paye'
            }
          })
        });

        if (!res.ok) throw new Error('Erreur API lors de la mise à jour du paiement');
        
        const updatedRaw = await res.json();
        const bureauMap: Record<string, Office> = {};
        offices.forEach((b: Office) => { bureauMap[b.id] = b; });
        const updatedPayment = mapPaiementDto(updatedRaw, bureauMap);

        setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
      } else {
        // Use a fixed time at noon UTC to safely avoid any timezone shift issues
        const safeMonth = String(monthIndex + 1).padStart(2, '0');
        const date = `${selectedYear}-${safeMonth}-01T12:00:00.000Z`;

        const res = await fetch('/api/paiements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_bureau: Number(officeId),
            montant: office.cotisation,
            date,
            etat: 'paye'
          })
        });

        if (!res.ok) throw new Error('Erreur API lors de la création du paiement');
        
        const newPaymentRaw = await res.json();
        const bureauMap: Record<string, Office> = {};
        offices.forEach((b: Office) => { bureauMap[b.id] = b; });
        const newPayment = mapPaiementDto(newPaymentRaw, bureauMap);

        setPayments(prev => [...prev, newPayment]);
      }

      setPendingQuickPay(null);
      
      toast({
        title: "Paiement enregistré",
        description: `Le paiement de ${office.name || 'Bureau ' + office.number} pour ${MONTHS_FULL[monthIndex]} a été enregistré avec succès.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de l'enregistrement du paiement.",
      });
    }
  };

  const handleManualAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const officeId = formData.get('bureauId') as string;
    const amount = Number(formData.get('amount'));
    const date = formData.get('date') as string;
    const etat = formData.get('etat') as string;

    if (!officeId || !amount || !date || !etat) return;

    try {
      const res = await fetch('/api/paiements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bureau: Number(officeId),
          montant: amount,
          date: new Date(date).toISOString(),
          etat
        })
      });

      if (!res.ok) throw new Error('Erreur lors de l\'ajout du paiement');
      
      const newPaymentRaw = await res.json();
      const bureauMap: Record<string, Office> = {};
      offices.forEach((b: Office) => { bureauMap[b.id] = b; });
      const newPayment = mapPaiementDto(newPaymentRaw, bureauMap);

      setPayments(prev => [...prev, newPayment]);
      
      toast({
        title: "Succès",
        description: "Le paiement a été enregistré manuellement.",
      });
      
      // Reset form visually or close dialog
      const form = e.target as HTMLFormElement;
      form.reset();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message,
      });
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingEditPayment) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const date = formData.get('date') as string;
    const etat = formData.get('etat') as string;

    try {
      // The pendingEditPayment.id might contain the 'PAY-' prefix depending on the mapper
      // Wait, mapPaiementDto does: `id: p.id_paiement ? String(p.id_paiement) : crypto.randomUUID()`
      // No, `p.id_paiement` is the exact numeric ID stringified. Wait, the mapping says:
      // `id: p.id_paiement ? String(p.id_paiement) : crypto.randomUUID()`
      // So id is exactly the numeric string! It is safe to parse.
      const res = await fetch('/api/paiements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(pendingEditPayment.id),
          data: {
            montant: amount,
            date: new Date(date).toISOString(),
            etat
          }
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la modification. Non autorisé?');

      const updatedRaw = await res.json();
      const bureauMap: Record<string, Office> = {};
      offices.forEach((b: Office) => { bureauMap[b.id] = b; });
      const updatedPayment = mapPaiementDto(updatedRaw, bureauMap);

      setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
      setPendingEditPayment(null);
      toast({ title: "Paiement modifié avec succès" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: "Erreur", description: err.message });
    }
  };

  const handleDeletePayment = async () => {
    if (!pendingEditPayment) return;

    try {
      const res = await fetch('/api/paiements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(pendingEditPayment.id) })
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression. Non autorisé?');

      setPayments(prev => prev.filter(p => p.id !== pendingEditPayment.id));
      setPendingEditPayment(null);
      toast({ title: "Paiement supprimé" });
    } catch (err: any) {
      toast({ variant: 'destructive', title: "Erreur", description: err.message });
    }
  };

  const year = Number(selectedYear);

  const bureauRows: BureauRow[] = useMemo(() =>
    offices.map(office => ({
      id: office.id,
      numero: `BUREAU${office.number}`,
      locataire: office.name || `Bureau ${office.number}`,
      months: Array.from({ length: 12 }, (_, monthIndex) => {
        const match = payments.find(p => {
          const d = new Date(p.date);
          return p.officeId === office.id && d.getFullYear() === year && d.getMonth() === monthIndex;
        });
        return match
          ? { status: match.etat === 'paye' ? 'paye' : 'non_paye' as PaymentStatus, amount: match.amount, paymentObj: match }
          : { status: 'non_paye' as PaymentStatus, amount: office.cotisation };
      }),
    })),
    [offices, payments, year]
  );

  const handleExportXLSX = () => {
    const dataToExport = filteredRows.map(row => {
      const exportRow: any = {
        'Bureau': row.numero,
        'Locataire': row.locataire
      };
      row.months.forEach((m, i) => {
        exportRow[MONTHS_FULL[i]] = m.status === 'paye' ? `Payé (${m.amount})` : 'Non payé';
      });
      return exportRow;
    });
    exportToXLSX(dataToExport, `Paiements_${year}`);
  };

  const filteredRows = useMemo(() => {
    return bureauRows.filter(row => {
      if (bureauFilter !== 'tous' && row.id !== bureauFilter) return false;
      if (statusFilter !== 'tous') return row.months.some(m => m.status === statusFilter);
      return true;
    });
  }, [bureauRows, bureauFilter, statusFilter]);

  const columns: ColumnDef<BureauRow>[] = useMemo(() => {
    const cols: ColumnDef<BureauRow>[] = [
      {
        accessorKey: 'numero',
        header: 'Bureau',
        cell: ({ row }) => <span className="font-bold">{row.original.numero}</span>,
      },
      {
        accessorKey: 'locataire',
        header: 'Locataire',
        cell: ({ row }) => (
          <span className="max-w-[100px] truncate text-muted-foreground block" title={row.original.locataire}>
            {row.original.locataire}
          </span>
        ),
      },
    ];

    MONTHS.forEach((m, mi) => {
      cols.push({
        id: `month_${mi}`,
        header: () => <div className="text-center w-[42px] px-0.5">{m}</div>,
        cell: ({ row }) => (
          <HeatCell 
            payment={row.original.months[mi]} 
            monthLabel={`${MONTHS_FULL[mi]} ${selectedYear}`} 
            onPay={() => setPendingQuickPay({ officeId: row.original.id, monthIndex: mi, existingPayment: row.original.months[mi].paymentObj })}
            onEdit={() => {
              if (row.original.months[mi].paymentObj) {
                setPendingEditPayment(row.original.months[mi].paymentObj!);
              }
            }}
          />
        ),
      });
    });

    return cols;
  }, [selectedYear, offices, payments]); 

  const exportXLSX = () => {
    const headers = ['Bureau', 'Locataire', ...MONTHS];
    const rows = filteredRows.map(row => [
      row.numero,
      row.locataire,
      ...row.months.map(m => `${statusConfig[m.status].label} - ${m.amount} MAD`),
    ]);

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 14 },
      { wch: 16 },
      ...MONTHS.map(() => ({ wch: 18 })),
    ];

    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1E293B' } },
          alignment: { horizontal: 'center' },
        };
      }
    }

    for (let r = 1; r <= rows.length; r++) {
      for (let c = 2; c <= MONTHS.length + 1; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (ws[cellRef]) {
          const val = String(ws[cellRef].v || '');
          const isPaye = val.startsWith('Payé');
          ws[cellRef].s = {
            font: { color: { rgb: isPaye ? '15803D' : 'B91C1C' } },
            alignment: { horizontal: 'center' },
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Revenus ${year}`);
    XLSX.writeFile(wb, `paiements-${year}.xlsx`);
  };

  const statusOptions = [
    { value: 'tous', label: 'Tous' },
    { value: 'paye', label: 'Payé' },
    { value: 'non_paye', label: 'Non payé' },
  ];

  const bureauOptions = [
    { value: 'tous', label: 'Tous' },
    ...bureauRows.map(row => ({ value: row.id, label: row.numero })),
  ];

  const defaultDate = new Date().toISOString().split('T')[0];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground mb-1">Paiements</h1>
          <p className="text-muted-foreground">Consultez et exportez l'historique des paiements par bureau</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Année</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Statut</span>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'tous' | PaymentStatus)}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Bureau</span>
                <Select value={bureauFilter} onValueChange={setBureauFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bureauOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportXLSX}>
                <Download className="w-4 h-4" />
                Exporter XLSX
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" variant="default">
                    <Plus className="w-4 h-4" />
                    Ajouter Paiement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un paiement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleManualAddPayment} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bureau</label>
                      <select name="bureauId" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="">Sélectionner un bureau...</option>
                        {offices.map(o => (
                          <option key={o.id} value={o.id}>Bureau {o.number} {o.name ? `(${o.name})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant (MAD)</label>
                      <Input type="number" name="amount" required placeholder="Ex: 500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" name="date" required defaultValue={defaultDate} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">État du paiement</label>
                      <select name="etat" required defaultValue="paye" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="paye">Payé</option>
                        <option value="non_paye">Non payé</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">Enregistrer le paiement</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Paiements {selectedYear}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Survolez une case pour voir les détails, ou cliquez sur une case rouge pour enregistrer rapidement un paiement.</p>
            </div>
          </div>

          <div className="px-6 pb-6">
            {loading ? (
              <p className="text-muted-foreground text-sm">Chargement...</p>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRows}
                searchKey="numero"
                searchPlaceholder="Rechercher par numéro de bureau..."
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog for Quick Pay */}
      <AlertDialog open={!!pendingQuickPay} onOpenChange={(open) => !open && setPendingQuickPay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le paiement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir enregistrer ce paiement pour le mois de {pendingQuickPay ? MONTHS_FULL[pendingQuickPay.monthIndex] : ''} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingQuickPay && handleQuickPay(pendingQuickPay.officeId, pendingQuickPay.monthIndex, pendingQuickPay.existingPayment)}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Payment Dialog */}
      <Dialog open={!!pendingEditPayment} onOpenChange={(open) => !open && setPendingEditPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {pendingEditPayment && (
            <form onSubmit={handleUpdatePayment} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Référence</label>
                <Input type="text" disabled defaultValue={pendingEditPayment.reference} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bureau</label>
                <Input type="text" disabled defaultValue={pendingEditPayment.tenantName || `Bureau ${pendingEditPayment.officeNumber}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant (MAD)</label>
                <Input type="number" name="amount" required defaultValue={pendingEditPayment.amount} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" name="date" required defaultValue={pendingEditPayment.date} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">État</label>
                <select name="etat" required defaultValue={pendingEditPayment.etat} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="paye">Payé</option>
                  <option value="non_paye">Non payé</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" className="flex-1">Mettre à jour</Button>
                <Button type="button" variant="destructive" onClick={handleDeletePayment} className="flex-1">
                  Supprimer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
