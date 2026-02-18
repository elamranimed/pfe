'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Office } from '@/app/lib/types';

interface OfficeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office: Office | null;
  onSave: (office: Office) => void;
}

export function OfficeModal({
  open,
  onOpenChange,
  office,
  onSave,
}: OfficeModalProps) {
  const [formData, setFormData] = useState<Office>({
    id: '',
    number: '',
    floor: 1,
    type: 'individual',
    surface: 0,
    monthlyRent: 0,
    charges: 0,
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (office) {
      setFormData(office);
    } else {
      setFormData({
        id: Math.random().toString(36).substring(2, 15),
        number: '',
        floor: 1,
        type: 'individual',
        surface: 0,
        monthlyRent: 0,
        charges: 0,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [office, open]);

  const handleSave = () => {
    if (!formData.number) {
      alert('Le numéro du bureau est requis');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {office ? 'Modifier Bureau' : 'Ajouter Bureau'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bureau Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Informations Bureau
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Numéro du Bureau
                </label>
                <Input
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  placeholder="101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Étage
                </label>
                <Input
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: parseInt(e.target.value) })
                  }
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as 'individual' | 'open-space' | 'meeting-room',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Bureau Individuel</SelectItem>
                    <SelectItem value="open-space">Open-Space</SelectItem>
                    <SelectItem value="meeting-room">Salle de Réunion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Surface (m²)
                </label>
                <Input
                  type="number"
                  value={formData.surface}
                  onChange={(e) =>
                    setFormData({ ...formData, surface: parseFloat(e.target.value) })
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loyer Mensuel (MAD)
                </label>
                <Input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) })
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Charges (MAD)
                </label>
                <Input
                  type="number"
                  value={formData.charges}
                  onChange={(e) =>
                    setFormData({ ...formData, charges: parseFloat(e.target.value) })
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Statut
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as 'available' | 'occupied' | 'maintenance',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Occupé</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tenant Section - Only show if occupied */}
          {formData.status === 'occupied' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Informations Locataire
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom Entreprise
                  </label>
                  <Input
                    value={formData.tenant?.companyName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: e.target.value,
                          contactName: formData.tenant?.contactName || '',
                          email: formData.tenant?.email || '',
                          phone: formData.tenant?.phone || '',
                          contractStart: formData.tenant?.contractStart || '',
                          contractEnd: formData.tenant?.contractEnd || '',
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                    placeholder="TechnoServ Maroc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom Contact
                  </label>
                  <Input
                    value={formData.tenant?.contactName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: formData.tenant?.companyName || '',
                          contactName: e.target.value,
                          email: formData.tenant?.email || '',
                          phone: formData.tenant?.phone || '',
                          contractStart: formData.tenant?.contractStart || '',
                          contractEnd: formData.tenant?.contractEnd || '',
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                    placeholder="Ahmed Hassan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.tenant?.email || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: formData.tenant?.companyName || '',
                          contactName: formData.tenant?.contactName || '',
                          email: e.target.value,
                          phone: formData.tenant?.phone || '',
                          contractStart: formData.tenant?.contractStart || '',
                          contractEnd: formData.tenant?.contractEnd || '',
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Téléphone
                  </label>
                  <Input
                    value={formData.tenant?.phone || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: formData.tenant?.companyName || '',
                          contactName: formData.tenant?.contactName || '',
                          email: formData.tenant?.email || '',
                          phone: e.target.value,
                          contractStart: formData.tenant?.contractStart || '',
                          contractEnd: formData.tenant?.contractEnd || '',
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Début Contrat
                  </label>
                  <Input
                    type="date"
                    value={formData.tenant?.contractStart || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: formData.tenant?.companyName || '',
                          contactName: formData.tenant?.contactName || '',
                          email: formData.tenant?.email || '',
                          phone: formData.tenant?.phone || '',
                          contractStart: e.target.value,
                          contractEnd: formData.tenant?.contractEnd || '',
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fin Contrat
                  </label>
                  <Input
                    type="date"
                    value={formData.tenant?.contractEnd || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant: {
                          ...formData.tenant,
                          id: formData.tenant?.id || '',
                          companyName: formData.tenant?.companyName || '',
                          contactName: formData.tenant?.contactName || '',
                          email: formData.tenant?.email || '',
                          phone: formData.tenant?.phone || '',
                          contractStart: formData.tenant?.contractStart || '',
                          contractEnd: e.target.value,
                          balance: formData.tenant?.balance || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
