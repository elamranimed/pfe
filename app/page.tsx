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
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-card">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: accentColor }} />
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: accentBg }}>
          {icon}
        </div>
      </CardContent>
    </Card>
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

  /* ─── Recent payments ─── */
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    Payé: {
      label: 'Payé',
      color: 'hsl(var(--primary))',
    },
    NonPaye: {
      label: 'Non payé',
      color: 'hsl(var(--destructive))',
    },
  } satisfies ChartConfig;

  /* ─── Logout ─── */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur de déconnexion', err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ────── Header ────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
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
                        <Cell key={`cell-${index}`} fill={entry.name === 'Payé' ? 'var(--color-Payé)' : 'var(--color-NonPaye)'} />
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

        {!loading && recentPayments.length > 0 && (
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(p.amount)}
                      </span>
                      <Badge variant={p.etat === 'paye' ? 'success' : p.etat === 'en_cours' ? 'warning' : 'destructive'}>
                        {p.etat === 'paye' ? 'Payé' : p.etat === 'en_cours' ? 'En cours' : 'Impayé'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </MainLayout>
  );
}