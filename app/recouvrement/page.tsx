'use client';

import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { RecouvrementTable, UnpaidOffice } from '@/components/recouvrement-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Office } from '@/lib/types';
import { Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToXLSX } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  const currentMonthLabel = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const handleExportXLSX = () => {
    const dataToExport = unpaidOffices.map(u => {
      const o = u.office;
      return {
        'Bureau': o.number,
        'Locataire': o.name || o.tenant?.companyName || '-',
        'Cotisation': o.cotisation,
        'Mois Impayés': u.moisImpayes,
        'Montant Total Dû': u.montantCumul,
        'Email': o.email || o.tenant?.email || '-',
        'Téléphone': o.telephone || o.tenant?.phone || '-'
      };
    });
    exportToXLSX(dataToExport, 'Recouvrement');
  };

  const sendRelance = async (office: Office, montantCumul: number, moisImpayes: number) => {
    if (!office.email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucun email enregistré pour ce bureau",
      });
      return;
    }

    setSendingEmails(prev => new Set(prev).add(office.id));

    try {
      console.log('🔵 Envoi de la relance...', {
        officeNumber: office.number,
        email: office.email,
        montantCumul,
        moisImpayes,
      });

      const response = await fetch('/api/relance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          officeNumber: office.number,
          officeName: office.name,
          email: office.email,
          telephone: office.telephone,
          moisImpayes,
          montantCumul,
        }),
      });

      console.log('🔵 Réponse statut:', response.status);

      const data = await response.json();
      console.log('🔵 Réponse données:', data);

      if (!response.ok) {
        console.error('❌ Erreur API:', data);
        throw new Error(data.error || data.details || 'Erreur lors de l\'envoi');
      }

      setSentEmails(prev => new Set(prev).add(office.id));
      
      toast({
        title: "✅ Email envoyé",
        description: `Relance envoyée à ${office.email}`,
      });

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer l'email",
      });
    } finally {
      setSendingEmails(prev => {
        const next = new Set(prev);
        next.delete(office.id);
        return next;
      });
    }
  };

  const sendAllRelances = async () => {
    const officesWithEmail = unpaidOffices.filter(u => u.office.email);
    
    if (officesWithEmail.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucun email",
        description: "Aucun bureau n'a d'email enregistré",
      });
      return;
    }

    toast({
      title: "Envoi en cours...",
      description: `Envoi de ${officesWithEmail.length} relances`,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const unpaid of officesWithEmail) {
      try {
        await sendRelance(unpaid.office, unpaid.montantCumul, unpaid.moisImpayes);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
      }
    }

    toast({
      title: "✅ Terminé",
      description: `${successCount} relance(s) envoyée(s)${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Recouvrement</h1>
          <p className="text-muted-foreground capitalize">
            Bureaux impayés — {currentMonthLabel}
          </p>
        </div>

        <Card className="border-border shadow-sm p-0">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 p-6 border-b border-border">
            <div>
              <CardTitle>Liste des bureaux impayés</CardTitle>
              <CardDescription>Cliquez sur une action pour envoyer une relance par email</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportXLSX}>
                <Download className="w-4 h-4" />
                Exporter XLSX
              </Button>
              <Button
                onClick={sendAllRelances}
                variant="destructive"
                disabled={unpaidOffices.filter(u => u.office.email).length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer toutes les relances
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {error && <p className="text-destructive mb-4 text-sm font-medium">{error}</p>}

            <RecouvrementTable
              unpaidOffices={unpaidOffices}
              loading={loading}
              sendingEmails={sendingEmails}
              sentEmails={sentEmails}
              onSendRelance={sendRelance}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}