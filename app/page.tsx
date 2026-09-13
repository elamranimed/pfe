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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { LogOut, Download } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip as ShadcnChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { KpiCard } from '@/components/kpi-card';
import { getUserRole } from '@/lib/auth';

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

/* ─── Removed Custom Dropdown ─── */

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




/* ═══════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'responsable' | null>(null);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const now = useMemo(() => new Date(), []);
  
  useEffect(() => {
    const resolvedRole = getUserRole();
    setRole(resolvedRole as 'admin' | 'responsable');
  }, []);

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
        const resB = await fetch('/api/bureaux', { credentials: 'include', cache: 'no-store' });
        if (!resB.ok) throw new Error('Erreur chargement bureaux');
        const bureaux = await resB.json();
        const mappedB = bureaux.map(mapBureauToOffice);
        const bureauMap: Record<string, Office> = {};
        mappedB.forEach((b: Office) => { bureauMap[b.id] = b; });

        const resP = await fetch('/api/paiements', { credentials: 'include', cache: 'no-store' });
        if (!resP.ok) throw new Error('Erreur chargement paiements');
        const paiements = await resP.json();

        const resE = await fetch('/api/depenses', { credentials: 'include', cache: 'no-store' });
        const expensesData = resE.ok ? await resE.json() : [];

        const resD = await fetch('/api/demandes', { credentials: 'include', cache: 'no-store' });
        const demandesData = resD.ok ? await resD.json() : [];

        if (!mounted) return;
        setOffices(mappedB);
        setPayments(paiements.map((p: any) => mapPaiementDto(p, bureauMap)));
        setExpenses(expensesData);
        setDemandes(demandesData);
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

    // Net Profit and Expenses
    const currentYearExpenses = expenses
      .filter(e => new Date(e.date).getFullYear() === year)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = collected - currentYearExpenses;

    // Bureaux à relancer (Unpaid offices for current year months that have passed)
    const activeOfficesToRemind = activeOffices.filter(office => {
      // Find if this office has any 'non_paye' payments in the past
      return payments.some(p => p.officeId === office.id && p.etat !== 'paye' && new Date(p.date) <= now);
    }).length;

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
      currentYearExpenses,
      netProfit,
      activeOfficesToRemind
    };
  }, [offices, payments, expenses, year, monthsElapsed]);

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
      { name: 'paye', label: 'Payé', value: kpis.collected, fill: 'var(--color-paye)' },
      { name: 'non_paye', label: 'Non payé', value: kpis.unpaid, fill: 'var(--color-non_paye)' },
    ];
  }, [kpis]);

  /* ─── Recent payments ─── */
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        const idA = Number(a.id.replace('PAY-', '')) || 0;
        const idB = Number(b.id.replace('PAY-', '')) || 0;
        return idB - idA;
      })
      .slice(0, 5);
  }, [payments]);

  /* ─── Chart Configs ─── */
  const barChartConfig = {
    Attendu: {
      label: 'Attendu',
      color: 'hsl(var(--muted-foreground))',
    },
    Collecté: {
      label: 'Collecté',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const pieChartConfig = {
    paye: {
      label: 'Payé',
      color: '#10b981',
    },
    non_paye: {
      label: 'Non payé',
      color: '#ef4444',
    },
  } satisfies ChartConfig;


  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ────── Header ────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">
              Bonjour {role ? (role === 'admin' ? 'Admin' : 'Responsable') : ''}
            </h1>
            <p className="text-muted-foreground">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* ────── KPI Summary Cards ────── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              label="Bénéfice Net"
              value={formatCurrency(kpis.netProfit)}
              trend={0}
              trendLabel="Sur l'année"
              accentColor="#6366f1"
              accentBg="rgba(99,102,241,0.1)"
            />
            <KpiCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              }
              label="À Relancer"
              value={String(kpis.activeOfficesToRemind)}
              trend={0}
              trendLabel="Locataires en retard"
              accentColor="#f43f5e"
              accentBg="rgba(244,63,94,0.1)"
            />
          </div>
        )}

        {/* ────── Charts Row ────── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart — Monthly Revenue */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-card-foreground">Revenus Mensuels</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Collecté vs Attendu — {selectedYear}</p>
                </div>
              </div>
              <ChartContainer config={barChartConfig} className="h-[280px] w-full">
                <BarChart data={monthlyChartData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <ShadcnChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Attendu" fill="var(--color-Attendu)" radius={[4, 4, 0, 0]} opacity={0.3} />
                  <Bar dataKey="Collecté" fill="var(--color-Collecté)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Donut Chart — Payment Distribution */}
            <div className="rounded-2xl p-6 flex flex-col bg-card border border-border shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-1">Répartition</h2>
              <p className="text-xs text-muted-foreground mb-4">Statut des paiements — {selectedYear}</p>

              <div className="flex-1 flex items-center justify-center relative">
                <ChartContainer config={pieChartConfig} className="h-[220px] w-full">
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
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ShadcnChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-card-foreground">{kpis.collectionRate}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recouvré</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  <span className="text-xs text-muted-foreground">Payé</span>
                  <span className="text-xs font-semibold text-foreground">{formatCurrency(kpis.collected)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
                  <span className="text-xs text-muted-foreground">Impayé</span>
                  <span className="text-xs font-semibold text-foreground">{formatCurrency(kpis.unpaid)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && (recentPayments.length > 0 || demandes.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
              <CardTitle>Derniers Paiements</CardTitle>
              <CardDescription>Les 5 paiements les plus récents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
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
                        <p className="text-sm font-medium text-foreground">
                          {p.tenantName || `Bureau ${p.officeNumber}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-bold text-foreground">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {p.etat}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernières Demandes</CardTitle>
              <CardDescription>Les demandes et réclamations récentes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {demandes.slice(0, 5).map((d: any) => (
                  <div key={d.id_demande} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground capitalize">
                        {d.objet}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Par: {d.created_by} — Le: {new Date(d.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${d.objet === 'reclamation' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {d.objet}
                    </span>
                  </div>
                ))}
                {demandes.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucune demande récente.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

      </div>
    </MainLayout>
  );
}