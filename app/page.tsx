'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Payment, Office } from '@/lib/types';
import * as XLSX from 'xlsx';

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

function Dropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10 transition-all min-w-[130px] justify-between"
      >
        <span>{selected?.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: '#1e2433', border: '1px solid rgba(255,255,255,0.12)', minWidth: 150 }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors"
              style={{
                color: value === opt.value ? '#60a5fa' : '#cbd5e1',
                background: value === opt.value ? 'rgba(96,165,250,0.1)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type PaymentStatus = 'paye' | 'non_paye';

interface MonthPayment {
  status: PaymentStatus;
  amount: number;
}

interface BureauRow {
  id: string;
  numero: string;
  locataire: string;
  months: MonthPayment[];
}

const MONTHS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'];

const statusConfig: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paye:     { label: 'Payé',     bg: 'rgba(6,78,59,0.35)',   text: '#34d399', dot: '#34d399' },
  non_paye: { label: 'Non payé', bg: 'rgba(127,29,29,0.35)', text: '#f87171', dot: '#f87171' },
};

function PaymentCell({ payment }: { payment: MonthPayment }) {
  const cfg = statusConfig[payment.status];
  return (
    <td className="px-1 py-1.5">
      <div style={{ background: cfg.bg, minWidth: 80 }} className="rounded-lg px-2 py-1.5 text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
          <span style={{ color: cfg.text }} className="text-[10px] font-semibold">{cfg.label}</span>
        </div>
        <p className="text-[11px] text-slate-300">
          {payment.amount.toLocaleString('fr-FR')},00 MAD
        </p>
      </div>
    </td>
  );
}

export default function DashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'tous' | PaymentStatus>('tous');
  const [bureauFilter, setBureauFilter] = useState('tous');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const now = new Date();

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = 2030; y >= 2020; y--) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resB = await fetch('/api/bureaux', { credentials: 'include' });
        if (!resB.ok) throw new Error('Erreur chargement bureaux');
        const bureaux = await resB.json();
        const mappedB = bureaux.map(mapBureauToOffice);
        const bureauMap: Record<string, Office> = {};
        mappedB.forEach((b: Office) => { bureauMap[b.id] = b; });

        const resP = await fetch('/api/paiements', { credentials: 'include' });
        if (!resP.ok) throw new Error('Erreur chargement paiements');
        const paiements = await resP.json();

        if (!mounted) return;
        setOffices(mappedB);
        setPayments(paiements.map((p: any) => mapPaiementDto(p, bureauMap)));
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

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
          ? { status: match.etat === 'paye' ? 'paye' : 'non_paye' as PaymentStatus, amount: match.amount }
          : { status: 'non_paye' as PaymentStatus, amount: office.cotisation };
      }),
    })),
    [offices, payments, year]
  );

  const filteredRows = bureauRows.filter(row => {
    if (bureauFilter !== 'tous' && row.id !== bureauFilter) return false;
    if (statusFilter !== 'tous') return row.months.some(m => m.status === statusFilter);
    return true;
  });

  const exportXLSX = () => {
    const headers = ['Bureau', 'Locataire', ...MONTHS];
    const rows = bureauRows.map(row => [
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur de déconnexion', err);
    }
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Tableau de Bord</h1>
            <p className="text-slate-500">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Année</span>
                <Dropdown value={selectedYear} onChange={setSelectedYear} options={availableYears} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Statut</span>
                <Dropdown
                  value={statusFilter}
                  onChange={v => setStatusFilter(v as 'tous' | PaymentStatus)}
                  options={statusOptions}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Bureau</span>
                <Dropdown value={bureauFilter} onChange={setBureauFilter} options={bureauOptions} />
              </div>
            </div>
            <button
              onClick={exportXLSX}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exporter XLSX
            </button>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Tableau des Revenus {selectedYear}
            </h2>
          </div>

          <div className="overflow-x-auto pb-4">
            {loading ? (
              <p className="text-slate-400 text-sm px-6 pb-6">Chargement...</p>
            ) : (
              <table className="w-full border-collapse" style={{ minWidth: 1100 }}>
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest w-28">Bureau</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest w-28">Locataire</th>
                    {MONTHS.map(m => (
                      <th key={m} className="text-center px-1 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(row => (
                    <tr key={row.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-2"><span className="text-xs font-bold text-slate-200">{row.numero}</span></td>
                      <td className="px-3 py-2"><span className="text-xs text-slate-400 uppercase tracking-wide">{row.locataire}</span></td>
                      {row.months.map((m, mi) => <PaymentCell key={mi} payment={m} />)}
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={14} className="text-center py-12 text-slate-500 text-sm">Aucun résultat trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center gap-6 px-6 py-3 border-t border-white/5">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                <span className="text-xs text-slate-400">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}