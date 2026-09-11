'use client';

import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { RecouvrementTable, UnpaidOffice } from '@/components/recouvrement-table';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Office } from '@/lib/types';
import { AlertTriangle, Building2, TrendingDown } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';

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

export default function RecouvrementPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);

        const resB = await fetch('/api/bureaux', { credentials: 'include' });
        if (!resB.ok) throw new Error('Erreur chargement bureaux');
        const bureaux = await resB.json();

        const resP = await fetch('/api/paiements', { credentials: 'include' });
        if (!resP.ok) throw new Error('Erreur chargement paiements');
        const pays = await resP.json();

        if (!mounted) return;
        setOffices(bureaux.map(mapBureauToOffice));
        setPaiements(pays);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const unpaidOffices = useMemo((): UnpaidOffice[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Pour chaque bureau occupé, calculer les mois impayés
    return offices
      .filter((o) => o.status === 'occupied')
      .map((office) => {
        // Paiements payés pour ce bureau
        const paiementsBureau = paiements.filter(
          (p) => String(p.id_bureau) === office.id && p.etat === 'paye'
        );

        // Construire un Set des mois payés "YYYY-MM"
        const moisPayes = new Set(
          paiementsBureau.map((p) => {
            const d = new Date(p.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          })
        );

        // Calculer les mois impayés depuis le début de l'année jusqu'au mois courant
        const moisImpayes: string[] = [];
        for (let m = 0; m <= currentMonth; m++) {
          const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
          if (!moisPayes.has(key)) {
            moisImpayes.push(key);
          }
        }

        const montantMoisEnCours = moisImpayes.includes(
          `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
        )
          ? office.cotisation
          : 0;

        const montantCumul = moisImpayes.length * office.cotisation;

        return {
          office,
          moisImpayes: moisImpayes.length,
          montantMoisEnCours,
          montantCumul,
        };
      })
      .filter((o) => o.moisImpayes > 0);
  }, [offices, paiements]);

  const totalUnpaid = unpaidOffices.reduce((sum, o) => sum + o.montantCumul, 0);
  const currentMonthLabel = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Recouvrement</h1>
          <p className="text-muted-foreground capitalize">
            Bureaux impayés — {currentMonthLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
            label="Bureaux impayés"
            value={String(unpaidOffices.length)}
            accentColor="#ef4444"
            accentBg="rgba(239, 68, 68, 0.1)"
          />
          <KpiCard
            icon={<TrendingDown className="w-5 h-5 text-amber-500" />}
            label="Montant total dû"
            value={formatCurrency(totalUnpaid)}
            accentColor="#f59e0b"
            accentBg="rgba(245, 158, 11, 0.1)"
          />
          <KpiCard
            icon={<Building2 className="w-5 h-5 text-slate-500" />}
            label="Total bureaux"
            value={String(offices.length)}
            accentColor="#64748b"
            accentBg="rgba(100, 116, 139, 0.1)"
          />
        </div>

        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-card-foreground">
              Liste des bureaux impayés
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Cliquez sur une action pour envoyer une relance par email</p>
          </div>

          <div className="p-6">
            {error && <p className="text-destructive mb-4 text-sm font-medium">{error}</p>}

            <RecouvrementTable
              unpaidOffices={unpaidOffices}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}