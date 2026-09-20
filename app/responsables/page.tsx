'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, Users } from 'lucide-react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserRole } from '@/lib/auth';

type Responsable = {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
};

type FormData = Omit<Responsable, 'id_user'> & { password: string };

const emptyForm: FormData = { nom: '', prenom: '', email: '', login: '', password: '' };

export default function ResponsablesPage() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'responsable' | null>(null);

  const loadResponsables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('Impossible de charger les responsables');
      setResponsables(await response.json());
      setError(null);
    } catch (loadError: any) {
      setError(loadError.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRole(getUserRole());
    loadResponsables();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (responsable: Responsable) => {
    setEditingId(responsable.id_user);
    setForm({ ...responsable, password: '' });
    setOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete (payload as Partial<FormData>).password;
      const response = await fetch('/api/users', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingId ? { id: editingId, data: payload } : payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur lors de l’enregistrement');
      setOpen(false);
      await loadResponsables();
    } catch (saveError: any) {
      setError(saveError.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce responsable ?')) return;
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || 'Erreur lors de la suppression');
      return;
    }
    setResponsables((current) => current.filter((responsable) => responsable.id_user !== id));
  };

  if (role !== 'admin') {
    return <MainLayout><div className="py-12 text-center text-red-600">Accès réservé à l’administrateur.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Gestion des profils</h1>
            <p className="text-muted-foreground">Gérez les comptes des responsables du syndic.</p>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Ajouter un responsable</Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Liste des responsables</CardTitle></CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            {loading ? <p className="py-8 text-center text-muted-foreground">Chargement...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left"><th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Login</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {responsables.map((responsable) => <tr key={responsable.id_user} className="border-b last:border-0">
                      <td className="p-3 font-medium">{responsable.prenom} {responsable.nom}</td><td className="p-3">{responsable.email}</td><td className="p-3">{responsable.login}</td>
                      <td className="p-3"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => openEdit(responsable)} title="Modifier"><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(responsable.id_user)} title="Supprimer" className="text-red-600"><Trash2 className="h-4 w-4" /></Button></div></td>
                    </tr>)}
                    {!responsables.length && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun responsable enregistré.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Modifier un responsable' : 'Ajouter un responsable'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['prenom', 'nom', 'email', 'login'] as const).map((field) => <div key={field} className="space-y-2"><Label htmlFor={field}>{field === 'prenom' ? 'Prénom' : field === 'nom' ? 'Nom' : field === 'email' ? 'Email' : 'Login'}</Label><Input id={field} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} required /></div>)}
            <div className="space-y-2"><Label htmlFor="password">Mot de passe {editingId && '(laisser vide pour conserver)'}</Label><Input id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingId} /></div>
            <Button type="submit" disabled={saving} className="w-full">{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}