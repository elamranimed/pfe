'use client';

import { useState, useMemo } from 'react';
import { Office } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export interface UnpaidOffice {
  office: Office;
  moisImpayes: number;
  montantMoisEnCours: number;
  montantCumul: number;
}

interface RecouvrementTableProps {
  unpaidOffices: UnpaidOffice[];
  loading: boolean;
}

export function RecouvrementTable({ unpaidOffices, loading }: RecouvrementTableProps) {
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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
        // Attendre 1 seconde entre chaque email pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
      }
    }

    toast({
      title: "Envoi terminé",
      description: `${successCount} envoyés, ${errorCount} erreurs`,
    });
  };

  const columns: ColumnDef<UnpaidOffice>[] = useMemo(() => [
    {
      accessorFn: (row) => row.office.number,
      id: 'officeNumber',
      header: 'Bureau',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800">
          #{row.original.office.number}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.office.name,
      id: 'officeName',
      header: 'Locataire',
      cell: ({ row }) => <span className="text-slate-700">{row.original.office.name || '—'}</span>,
    },
    {
      accessorFn: (row) => row.office.type,
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.office.type === 'individual' ? 'Individuel' : row.original.office.type === 'open-space' ? 'Open Space' : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'moisImpayes',
      header: 'Mois impayés',
      cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.moisImpayes} mois</span>,
    },
    {
      accessorKey: 'montantMoisEnCours',
      header: 'Mois en cours',
      cell: ({ row }) => (
        <span className="font-bold text-orange-600">
          {formatCurrency(row.original.montantMoisEnCours)}
        </span>
      ),
    },
    {
      accessorKey: 'montantCumul',
      header: 'Cumul total',
      cell: ({ row }) => (
        <span className="font-bold text-red-600">
          {formatCurrency(row.original.montantCumul)}
        </span>
      ),
    },
    {
      id: 'statut',
      header: 'Statut',
      cell: () => (
        <Badge variant="destructive">
          Impayé
        </Badge>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const { office, montantCumul, moisImpayes } = row.original;
        const isSending = sendingEmails.has(office.id);
        const isSent = sentEmails.has(office.id);

        return (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => sendRelance(office, montantCumul, moisImpayes)}
            disabled={!office.email || isSending}
            title={!office.email ? 'Aucun email enregistré' : `Envoyer à ${office.email}`}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSent ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {isSending ? 'Envoi...' : isSent ? 'Envoyé' : 'Relancer'}
          </Button>
        );
      },
    },
  ], [sendingEmails, sentEmails]);

  if (loading) {
    return <p className="text-slate-500 py-6 text-center">Chargement...</p>;
  }

  if (unpaidOffices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-3 text-green-400" />
        <p className="text-lg font-medium text-slate-600">Aucun impayé</p>
        <p className="text-sm text-slate-400 mt-1">Tous les bureaux sont à jour 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={sendAllRelances}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={unpaidOffices.filter(u => u.office.email).length === 0}
        >
          <Mail className="w-4 h-4 mr-2" />
          Envoyer toutes les relances
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={unpaidOffices}
        searchKey="officeNumber"
        searchPlaceholder="Rechercher par N° Bureau..."
      />
    </div>
  );
}