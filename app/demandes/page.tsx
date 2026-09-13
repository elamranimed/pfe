'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportToXLSX } from '@/lib/utils';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDemande, setNewDemande] = useState({ objet: 'reclamation', created_by: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDemandes = () => {
    setLoading(true);
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
  };

  const handleExportXLSX = () => {
    const dataToExport = demandes.map(d => ({
      'ID': d.id_demande,
      'Type': d.objet,
      'Date': d.created_at ? format(new Date(d.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
      'Demandeur': d.created_by
    }));
    exportToXLSX(dataToExport, 'Demandes');
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDemande)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewDemande({ objet: 'reclamation', created_by: '' });
        fetchDemandes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground mb-1">Demandes & Réclamations</h1>
          <p className="text-muted-foreground">Gérez les requêtes et réclamations des locataires.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div>
              <CardTitle>Historique des demandes</CardTitle>
              <CardDescription>Liste de toutes les demandes enregistrées</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportXLSX}>
                <Download className="w-4 h-4" />
                Exporter XLSX
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle demande
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Ajouter une demande</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="objet">Type de demande</Label>
                        <Select
                          value={newDemande.objet}
                          onValueChange={(val) => setNewDemande({ ...newDemande, objet: val })}
                        >
                          <SelectTrigger id="objet">
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reclamation">Réclamation</SelectItem>
                            <SelectItem value="creation">Création</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="created_by">Demandeur</Label>
                        <Input 
                          id="created_by"
                          placeholder="Nom du locataire ou déclarant"
                          value={newDemande.created_by}
                          onChange={(e) => setNewDemande({ ...newDemande, created_by: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Création...' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
