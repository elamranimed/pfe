'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Payment, Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  PieChart, Pie,
} from 'recharts';

/* ─── Data mappers (unchanged) ─── */
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

/* ─── Dropdown (unchanged) ─── */
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

/* ─── Types & Constants ─── */
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
const MONTHS_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const statusConfig: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paye:     { label: 'Payé',     bg: 'rgba(6,78,59,0.35)',   text: '#34d399', dot: '#34d399' },
  non_paye: { label: 'Non payé', bg: 'rgba(127,29,29,0.35)', text: '#f87171', dot: '#f87171' },
};

const PIE_COLORS = ['#34d399', '#f87171'];

/* ─── KPI Card Component ─── */
function KpiCard({ icon, label, value, trend, trendLabel, accentColor, accentBg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: accentColor }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: accentBg }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Heat-map Cell (compact colored square + tooltip) ─── */
function HeatCell({ payment, monthLabel }: { payment: MonthPayment; monthLabel: string }) {
  const [showTip, setShowTip] = useState(false);
  const isPaid = payment.status === 'paye';
  return (
    <td className="px-0.5 py-2">
      <div className="flex justify-center">
        <div
          className="relative"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <div
            className="w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center"
            style={{
              background: isPaid
                ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
              boxShadow: isPaid
                ? '0 2px 8px rgba(52,211,153,0.3)'
                : '0 2px 8px rgba(248,113,113,0.25)',
            }}
          >
            {isPaid ? (
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
                  {isPaid ? 'Payé' : 'Non payé'}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                {payment.amount.toLocaleString('fr-FR')},00 MAD
              </p>
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-px"
                style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1a1f2e' }}
              />
            </div>
          )}
        </div>
      </div>
    </td>
  );
}

/* ─── Custom Recharts Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-white">{Number(entry.value).toLocaleString('fr-FR')} MAD</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════════ */
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
  const monthsElapsed = year === now.getFullYear() ? now.getMonth() + 1 : 12;

  /* ─── KPI computations ─── */
  const kpis = useMemo(() => {
    const activeOffices = offices.filter(o => o.status === 'occupied');
    const expectedRevenue = activeOffices.reduce((sum, o) => sum + o.cotisation * monthsElapsed, 0);

    const yearPayments = payments.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === year && p.etat === 'paye';
    });
    const collected = yearPayments.reduce((sum, p) => sum + p.amount, 0);
    const unpaid = Math.max(0, expectedRevenue - collected);
    const collectionRate = expectedRevenue > 0 ? Math.round((collected / expectedRevenue) * 100) : 0;

    // Previous year comparison
    const prevYear = year - 1;
    const prevCollected = payments
      .filter(p => new Date(p.date).getFullYear() === prevYear && p.etat === 'paye')
      .reduce((sum, p) => sum + p.amount, 0);
    const prevExpected = activeOffices.reduce((sum, o) => sum + o.cotisation * 12, 0);
    const prevCollectionRate = prevExpected > 0 ? Math.round((prevCollected / prevExpected) * 100) : 0;

    // Normalized monthly comparison
    const avgMonthly = monthsElapsed > 0 ? collected / monthsElapsed : 0;
    const prevAvgMonthly = prevCollected / 12;
    const revenueTrend = prevAvgMonthly > 0 ? Math.round(((avgMonthly - prevAvgMonthly) / prevAvgMonthly) * 100) : 0;
    const unpaidPrev = Math.max(0, prevExpected - prevCollected);
    const unpaidTrend = unpaidPrev > 0 ? Math.round(((unpaid - unpaidPrev) / unpaidPrev) * 100) : 0;

    return {
      collected,
      unpaid,
      collectionRate,
      activeOffices: activeOffices.length,
      totalOffices: offices.length,
      expectedRevenue,
      revenueTrend,
      rateTrend: collectionRate - prevCollectionRate,
      unpaidTrend,
    };
  }, [offices, payments, year, monthsElapsed]);

  /* ─── Bar chart data (monthly Collecté vs Attendu) ─── */
  const monthlyChartData = useMemo(() => {
    const activeOffices = offices.filter(o => o.status === 'occupied');
    const monthlyExpected = activeOffices.reduce((sum, o) => sum + o.cotisation, 0);

    return Array.from({ length: 12 }, (_, i) => {
      const collected = payments
        .filter(p => {
          const d = new Date(p.date);
          return d.getFullYear() === year && d.getMonth() === i && p.etat === 'paye';
        })
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        month: MONTHS[i],
        Collecté: collected,
        Attendu: monthlyExpected,
      };
    });
  }, [offices, payments, year]);

  /* ─── Pie chart data (payé vs non payé for the year) ─── */
  const pieData = useMemo(() => {
    return [
      { name: 'Payé', value: kpis.collected },
      { name: 'Non payé', value: kpis.unpaid },
    ];
  }, [kpis]);

  /* ─── Revenue table rows (unchanged logic) ─── */
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

  /* ─── Recent payments ─── */
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [payments]);

  /* ─── XLSX export (unchanged) ─── */
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

  /* ─── Logout ─── */
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

        {/* ────── Header ────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">Tableau de Bord</h1>
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

        {/* ────── KPI Summary Cards ────── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              label="Revenus Collectés"
              value={formatCurrency(kpis.collected)}
              trend={kpis.revenueTrend}
              trendLabel={`vs ${year - 1}`}
              accentColor="#10b981"
              accentBg="rgba(16,185,129,0.1)"
            />
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              label="Montant Impayé"
              value={formatCurrency(kpis.unpaid)}
              trend={kpis.unpaidTrend !== 0 ? -kpis.unpaidTrend : undefined}
              trendLabel={kpis.unpaidTrend !== 0 ? `vs ${year - 1}` : undefined}
              accentColor="#f59e0b"
              accentBg="rgba(245,158,11,0.1)"
            />
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }
              label="Taux de Recouvrement"
              value={`${kpis.collectionRate}%`}
              trend={kpis.rateTrend !== 0 ? kpis.rateTrend : undefined}
              trendLabel={kpis.rateTrend !== 0 ? `pts vs ${year - 1}` : undefined}
              accentColor="#3b82f6"
              accentBg="rgba(59,130,246,0.1)"
            />
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
                </svg>
              }
              label="Bureaux Actifs"
              value={`${kpis.activeOffices} / ${kpis.totalOffices}`}
              accentColor="#8b5cf6"
              accentBg="rgba(139,92,246,0.1)"
            />
          </div>
        )}

        {/* ────── Charts Row ────── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart — Monthly Revenue */}
            <div
              className="lg:col-span-2 rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Revenus Mensuels</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Collecté vs Attendu — {selectedYear}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#34d399' }} />
                    <span className="text-xs text-slate-400">Collecté</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(148,163,184,0.3)' }} />
                    <span className="text-xs text-slate-400">Attendu</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyChartData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="Attendu" fill="rgba(148,163,184,0.2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Collecté" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart — Payment Distribution */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h2 className="text-lg font-bold text-white mb-1">Répartition</h2>
              <p className="text-xs text-slate-400 mb-4">Statut des paiements — {selectedYear}</p>

              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg px-3 py-2 shadow-xl" style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p className="text-xs text-white">
                              {payload[0].name}: <span className="font-bold">{Number(payload[0].value).toLocaleString('fr-FR')} MAD</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{kpis.collectionRate}%</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Recouvré</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  <span className="text-xs text-slate-400">Payé</span>
                  <span className="text-xs font-semibold text-slate-200">{formatCurrency(kpis.collected)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
                  <span className="text-xs text-slate-400">Impayé</span>
                  <span className="text-xs font-semibold text-slate-200">{formatCurrency(kpis.unpaid)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────── Revenue Heat-Map Grid ────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Toolbar */}
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

          {/* Title + subtitle */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Suivi des Paiements {selectedYear}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Survolez une case pour voir les détails du paiement</p>
          </div>

          {/* Heat-map Grid */}
          <div className="overflow-x-auto pb-2">
            {loading ? (
              <p className="text-slate-400 text-sm px-6 pb-6">Chargement...</p>
            ) : (
              <table className="w-full border-collapse" style={{ minWidth: 850 }}>
                <thead>
                  <tr>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest" style={{ minWidth: 120 }}>Bureau</th>
                    <th className="text-left px-2 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest" style={{ minWidth: 100 }}>Locataire</th>
                    {MONTHS.map(m => (
                      <th key={m} className="text-center px-0.5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider" style={{ width: 42 }}>{m}</th>
                    ))}
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest" style={{ minWidth: 110 }}>Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, ri) => {
                    const paidCount = row.months.filter(m => m.status === 'paye').length;
                    const paidPct = Math.round((paidCount / 12) * 100);
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-white/[0.03]"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <td className="px-6 py-1.5">
                          <span className="text-xs font-bold text-slate-200">{row.numero}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs text-slate-400 truncate block max-w-[100px]">{row.locataire}</span>
                        </td>
                        {row.months.map((m, mi) => (
                          <HeatCell key={mi} payment={m} monthLabel={`${MONTHS_FULL[mi]} ${selectedYear}`} />
                        ))}
                        {/* Progress column */}
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${paidPct}%`,
                                  background: paidPct === 100
                                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                                    : paidPct >= 50
                                      ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                      : 'linear-gradient(90deg, #f87171, #ef4444)',
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold tabular-nums" style={{
                              color: paidPct === 100 ? '#34d399' : paidPct >= 50 ? '#fbbf24' : '#f87171'
                            }}>
                              {paidCount}/12
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-12 text-slate-500 text-sm">Aucun résultat trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-[3px]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-xs text-slate-400">Payé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-[3px]">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <span className="text-xs text-slate-400">Non payé</span>
            </div>
            <div className="ml-auto text-[10px] text-slate-500">
              {filteredRows.length} bureau{filteredRows.length > 1 ? 'x' : ''} affiché{filteredRows.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ────── Recent Payments ────── */}
        {!loading && recentPayments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Derniers Paiements</h2>
              <p className="text-xs text-slate-400 mt-0.5">Les 5 paiements les plus récents</p>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: p.etat === 'paye' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: p.etat === 'paye' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {p.officeNumber ? `B${p.officeNumber}` : '—'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {p.tenantName || `Bureau ${p.officeNumber}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCurrency(p.amount)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: p.etat === 'paye' ? 'rgba(16,185,129,0.1)' : p.etat === 'en_cours' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: p.etat === 'paye' ? '#10b981' : p.etat === 'en_cours' ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {p.etat === 'paye' ? 'Payé' : p.etat === 'en_cours' ? 'En cours' : 'Impayé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}