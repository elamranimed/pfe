import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { Tenant, Office } from '@/types';

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  availableOffices: Office[];
  onSave: (tenant: Tenant) => void;
}

export function TenantDialog({ open, onOpenChange, tenant, availableOffices, onSave }: TenantDialogProps) {
  const [formData, setFormData] = useState<Partial<Tenant>>(
    tenant || {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      officeId: '',
      contractStart: new Date().toISOString().split('T')[0],
      contractEnd: '',
      monthlyTotal: 0,
      balance: 0,
      status: 'active',
    }
  );

  const handleOfficeChange = (officeId: string) => {
    const office = availableOffices.find(o => o.id === officeId);
    if (office) {
      setFormData({
        ...formData,
        officeId,
        monthlyTotal: office.monthlyRent
      });
    } else {
      setFormData({ ...formData, officeId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: tenant?.id || `ten-${Math.random().toString(36).substr(2, 9)}`,
    } as Tenant);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tenant ? 'Modifier le locataire' : 'Ajouter un locataire'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations du locataire ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input 
              id="companyName" 
              value={formData.companyName} 
              onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Nom du contact</Label>
            <Input 
              id="contactName" 
              value={formData.contactName} 
              onChange={e => setFormData({ ...formData, contactName: e.target.value })} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="officeId">Bureau</Label>
            <Select 
              value={formData.officeId} 
              onValueChange={handleOfficeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un bureau" />
              </SelectTrigger>
              <SelectContent>
                {availableOffices.map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.number} ({o.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractStart">Début contrat</Label>
              <Input 
                id="contractStart" 
                type="date"
                value={formData.contractStart} 
                onChange={e => setFormData({ ...formData, contractStart: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractEnd">Fin contrat</Label>
              <Input 
                id="contractEnd" 
                type="date"
                value={formData.contractEnd} 
                onChange={e => setFormData({ ...formData, contractEnd: e.target.value })} 
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyTotal">Total Mensuel (MAD)</Label>
              <Input 
                id="monthlyTotal" 
                type="number"
                value={formData.monthlyTotal} 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: any) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="ending-soon">Fin de contrat</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
