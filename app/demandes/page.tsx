'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/demandes')
      .then(res => res.json())
      .then(data => {
        setDemandes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground mb-1">Demandes & Réclamations</h1>
          <p className="text-muted-foreground">Gérez les requêtes et réclamations des locataires.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des demandes</CardTitle>
            <CardDescription>Liste de toutes les demandes enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Par</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {demandes.map(d => (
                      <tr key={d.id_demande} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium">#{d.id_demande}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${d.objet === 'reclamation' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {d.objet}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {d.created_at ? format(new Date(d.created_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : '-'}
                        </td>
                        <td className="px-6 py-4">{d.created_by}</td>
                      </tr>
                    ))}
                    {demandes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune demande trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
