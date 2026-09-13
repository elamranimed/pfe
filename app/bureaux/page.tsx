'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { OfficesTable } from '@/components/offices-table';
import { OfficeModal } from '@/components/office-modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { exportToXLSX } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Office } from '@/lib/types';

import { getUserRole } from '@/lib/auth';

type FilterStatus = 'all' | 'available' | 'occupied' | 'maintenance';

const bureauxApi = {
  getAll: async () => {
    const res = await fetch('/api/bureaux', { credentials: 'include' });
    if (!res.ok) throw new Error('Erreur chargement bureaux');
    return res.json();
  },
  create: async (data: any) => {
    const res = await fetch('/api/bureaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création bureau');
    return res.json();
  },
  update: async (id: string, data: any) => {
    const res = await fetch('/api/bureaux', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, data }),
    });
    if (!res.ok) throw new Error('Erreur modification bureau');
    return res.json();
  },
  delete: async (id: string) => {
    const res = await fetch('/api/bureaux', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Erreur suppression bureau');
    return res.json();
  },
};

const mapBureauToOffice = (b: any): Office => ({
  id:         String(b.id_bureau),
  number:     b.numero || String(b.id_bureau),  // champ numéro dédié, fallback sur id
  name:       b.nom || '',                       // nom est le nom du bureau, pas le numéro
  floor:      b.etage,
  type:       b.type === 'individuel' ? 'individual' : 'open-space',
  cotisation: b.cotisation,
  status:     b.statut === 'actif' ? 'occupied' : 'available',
  telephone:  b.telephone || '',
  email:      b.email || '',
  notes:      '',
  createdAt:  new Date().toISOString(),
  updatedAt:  new Date().toISOString(),
});

const mapOfficeToBureau = (o: Office) => ({
  numero:     parseInt(o.number) || null,         
  nom:        o.name || '',      
  etage:      o.floor,
  type:       o.type === 'individual' ? 'individuel' : 'centre',
  statut:     o.status === 'occupied' ? 'actif' : 'inactif',
  cotisation: o.cotisation,
  telephone:  o.telephone || null,
  email:      o.email || null,
});

export default function BureauxPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<'admin' | 'responsable' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  useEffect(() => {
    const resolvedRole = getUserRole();
    setRole(resolvedRole);
    setRoleLoading(false);
  }, []);

  console.log("Role détecté:", role);

  useEffect(() => {
    bureauxApi.getAll()
      .then((data) => setOffices(data.map(mapBureauToOffice)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOffices =
    filter === 'all' ? offices : offices.filter((o) => o.status === filter);

  const handleAddOffice = async (newOffice: Office) => {
    try {
      const created = await bureauxApi.create(mapOfficeToBureau(newOffice));
      setOffices([...offices, mapBureauToOffice(created)]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOffice = async (updatedOffice: Office) => {
    try {
      const updated = await bureauxApi.update(updatedOffice.id, mapOfficeToBureau(updatedOffice));
      setOffices(offices.map((o) => (o.id === updatedOffice.id ? mapBureauToOffice(updated) : o)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteOffice = async (officeId: string) => {
    try {
      await bureauxApi.delete(officeId);
      setOffices(offices.filter((o) => o.id !== officeId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportXLSX = () => {
    const dataToExport = filteredOffices.map(o => ({
      'Bureau': o.number,
      'Locataire': o.name || o.tenant?.companyName || '-',
      'Étage': o.floor,
      'Type': o.type === 'individual' ? 'Individuel' : o.type === 'open-space' ? 'Open-Space' : 'Salle de Réunion',
      'Téléphone': o.telephone || o.tenant?.phone || '-',
      'Email': o.email || o.tenant?.email || '-',
      'Cotisation': o.cotisation,
      'Statut': o.status === 'occupied' ? 'Occupé' : o.status === 'maintenance' ? 'Maintenance' : 'Disponible'
    }));
    exportToXLSX(dataToExport, 'Bureaux');
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bureaux & Locataires
          </h1>
          <p className="text-muted-foreground">
            Gestion unifiée des bureaux et informations locataires
          </p>
        </div>

        <Card className="border-border shadow-sm p-0">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 p-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Filtrer</span>
                <Select value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
                  <SelectTrigger className="w-[150px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Occupé</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportXLSX}>
                <Download className="w-4 h-4" />
                Exporter XLSX
              </Button>
              {role === 'admin' && (
                <Button
                  onClick={() => {
                    setEditingOffice(null);
                    setShowAddModal(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter Bureau
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading && <p className="text-slate-500 text-center py-8">Chargement...</p>}
            {error && <p className="text-red-500 text-center py-8">{error}</p>}
            {!loading && !error && (
              <OfficesTable
                offices={filteredOffices}
                onAddOffice={handleAddOffice}
                onUpdateOffice={handleUpdateOffice}
                onDeleteOffice={handleDeleteOffice}
                onEditOffice={(office) => {
                  setEditingOffice(office);
                  setShowAddModal(true);
                }}
                userRole={role}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <OfficeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        office={editingOffice}
        onSave={(office) => {
          if (editingOffice) {
            handleUpdateOffice(office);
          } else {
            handleAddOffice(office);
          }
          setShowAddModal(false);
          setEditingOffice(null);
        }}
      />
    </MainLayout>
  );
}