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
import { Checkbox } from '@/components/ui/checkbox';
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
      surface: 0,
      monthlyRent: 0,
      charges: 0,
      status: 'available',
      hasAC: false,
      hasHeating: false,
      internetAccess: false,
      furnished: false,
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
              <Label htmlFor="floor">Étage</Label>
              <Input 
                id="floor" 
                type="number" 
                value={formData.floor} 
                onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })} 
                required 
              />
            </div>
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
                <SelectItem value="open-space">Open Space</SelectItem>
                <SelectItem value="meeting-room">Salle de réunion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surface">Surface (m²)</Label>
              <Input 
                id="surface" 
                type="number" 
                value={formData.surface} 
                onChange={e => setFormData({ ...formData, surface: parseInt(e.target.value) })} 
                required 
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
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupé</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Loyer (MAD)</Label>
              <Input 
                id="rent" 
                type="number" 
                value={formData.monthlyRent} 
                onChange={e => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="charges">Charges (MAD)</Label>
              <Input 
                id="charges" 
                type="number" 
                value={formData.charges} 
                onChange={e => setFormData({ ...formData, charges: parseInt(e.target.value) })} 
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasAC" 
                checked={formData.hasAC} 
                onCheckedChange={(v: boolean) => setFormData({ ...formData, hasAC: v })} 
              />
              <Label htmlFor="hasAC">Climatisation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasHeating" 
                checked={formData.hasHeating} 
                onCheckedChange={(v: boolean) => setFormData({ ...formData, hasHeating: v })} 
              />
              <Label htmlFor="hasHeating">Chauffage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="internet" 
                checked={formData.internetAccess} 
                onCheckedChange={(v: boolean) => setFormData({ ...formData, internetAccess: v })} 
              />
              <Label htmlFor="internet">Internet</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="furnished" 
                checked={formData.furnished} 
                onCheckedChange={(v: boolean) => setFormData({ ...formData, furnished: v })} 
              />
              <Label htmlFor="furnished">Meublé</Label>
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
