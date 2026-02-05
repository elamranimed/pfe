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
import type { Office } from '@/types';

interface OfficeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office?: Office | null;
  onSave: (office: Office) => void;
}

export function OfficeDialog({ open, onOpenChange, office, onSave }: OfficeDialogProps) {
  const [formData, setFormData] = useState<Partial<Office>>(
    office || {
      number: '',
      floor: 1,
      type: 'individual',
      monthlyRent: 0,
      status: 'available',
      tenantName: '',
      tenantPhone: '',
      tenantEmail: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: office?.id || `off-${Math.random().toString(36).substr(2, 9)}`,
    } as Office);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{office ? 'Modifier le bureau' : 'Ajouter un bureau'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations du bureau ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro</Label>
              <Input 
                id="number" 
                value={formData.number} 
                onChange={e => setFormData({ ...formData, number: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName">Nom Locataire</Label>
              <Input 
                id="tenantName" 
                value={formData.tenantName || ''} 
                onChange={e => setFormData({ ...formData, tenantName: e.target.value })} 
                placeholder="Nom du locataire (optionnel)"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Étage</Label>
              <Input 
                id="floor" 
                type="number" 
                value={formData.floor} 
                onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantPhone">Téléphone</Label>
              <Input 
                id="tenantPhone" 
                value={formData.tenantPhone || ''} 
                onChange={e => setFormData({ ...formData, tenantPhone: e.target.value })} 
                placeholder="+212 XXX XXX XXX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantEmail">Email</Label>
            <Input 
              id="tenantEmail" 
              type="email"
              value={formData.tenantEmail || ''} 
              onChange={e => setFormData({ ...formData, tenantEmail: e.target.value })} 
              placeholder="email@exemple.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v: any) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individuel</SelectItem>
                <SelectItem value="centre-de-formation">Centre de formation</SelectItem>
              
              </SelectContent>
            </Select>
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
                <SelectItem value="available">Vide/Disponible</SelectItem>
                <SelectItem value="occupied">Occupé</SelectItem>
                <SelectItem value="renovation">Aménagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent">Cotisation (MAD)</Label>
            <Input 
              id="rent" 
              type="number" 
              value={formData.monthlyRent} 
              onChange={e => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })} 
              required 
            />
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
