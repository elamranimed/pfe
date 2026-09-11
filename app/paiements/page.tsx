'use client';

import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { PaymentsTable } from '@/components/payments-table';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Payment, Office } from '@/lib/types';

import { getUserRole } from '@/lib/auth';


type FilterPeriod = 'this-month' | 'three-months' | 'all';

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

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('this-month');
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<'admin' | 'responsable' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const resolvedRole = getUserRole();
    setRole(resolvedRole);
    setRoleLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const resB = await fetch('/api/bureaux', { credentials: 'include' });
        if (!resB.ok) throw new Error('Erreur chargement bureaux');
        const bureaux = await resB.json();
        const mappedB = bureaux.map(mapBureauToOffice);
        const bureauMap: Record<string, Office> = {};
        mappedB.forEach((b: Office) => { bureauMap[b.id] = b; });
        if (!mounted) return;
        setOffices(mappedB);
        setLoadingOffices(false);

        const resP = await fetch('/api/paiements', { credentials: 'include' });
        if (!resP.ok) throw new Error('Erreur chargement paiements');
        const paiements = await resP.json();
        if (!mounted) return;
        setPayments(paiements.map((p: any) => mapPaiementDto(p, bureauMap)));
      } catch (err: any) {
        if (mounted) setError(err.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const sorted = [...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filterPeriod === 'this-month') {
      return sorted.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (filterPeriod === 'three-months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return sorted.filter((p) => new Date(p.date) >= threeMonthsAgo);
    }
    return sorted;
  }, [payments, filterPeriod]);

  const totalCollected = filteredPayments
    .filter((p) => p.etat === 'paye' || p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = async (payload: {
    bureauId: string;
    amount: number;
    date: string;
    etat: 'paye' | 'en_cours' | 'impaye';
  }) => {
    const res = await fetch('/api/paiements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        montant: payload.amount,
        date: new Date(`${payload.date}T00:00:00`).toISOString(),
        id_bureau: Number(payload.bureauId),
        etat: payload.etat,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || 'Erreur création paiement');
    }
    const created = await res.json();
    const bureauMap: Record<string, Office> = {};
    offices.forEach((b) => { bureauMap[b.id] = b; });

    const mapped = mapPaiementDto(created, bureauMap);
    mapped.etat = payload.etat;
    mapped.status = payload.etat === 'paye' ? 'paid' : 'pending';

    setPayments((prev) => [mapped, ...prev]);
  };

  const handleUpdatePayment = async (payload: {
    id?: string;
    bureauId: string;
    amount: number;
    date: string;
    etat: 'paye' | 'en_cours' | 'impaye';
  }) => {
    if (!payload.id) return;
    const res = await fetch('/api/paiements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: Number(payload.id),
        data: {
          montant: payload.amount,
          date: new Date(`${payload.date}T00:00:00`).toISOString(),
          id_bureau: Number(payload.bureauId),
          etat: payload.etat,
        },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || 'Erreur mise à jour paiement');
    }
    const updated = await res.json();
    const bureauMap: Record<string, Office> = {};
    offices.forEach((b) => { bureauMap[b.id] = b; });

    const mapped = mapPaiementDto(updated, bureauMap);
    mapped.etat = payload.etat;
    mapped.status = payload.etat === 'paye' ? 'paid' : 'pending';

    setPayments((prev) => prev.map((p) => (p.id === payload.id ? mapped : p)));
  };

  const handleDeletePayment = async (id: string) => {
    const res = await fetch('/api/paiements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: Number(id) }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || 'Erreur suppression paiement');
    }
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  if (roleLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Vérification du rôle...</div>
      </MainLayout>
    );
  }

  if (!role) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-red-600">
          Accès refusé. Vous devez être connecté en tant qu'administrateur ou responsable.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Paiements</h1>
          <p className="text-muted-foreground">Gestion des paiements de cotisations et charges</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Période:</span>
              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Ce Mois</SelectItem>
                  <SelectItem value="three-months">3 Derniers Mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Collecté</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCollected)}</p>
            </div>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading && <p className="text-slate-500 mb-4">Chargement...</p>}

          <PaymentsTable
            payments={filteredPayments}
            offices={offices}
            loadingOffices={loadingOffices}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
            userRole={role}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
