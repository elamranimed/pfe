'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Office } from '@/lib/types';

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
    name: '',
    floor: 1,
    telephone: '',
    email: '',
    type: 'individual',
    cotisation: 0,
    status: 'available',
    notes: '',
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
        name: '',
        floor: 1,
        telephone: '',
        email: '',
        type: 'individual',
        cotisation: 0,
        status: 'available',
        notes: '',
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
                  Nom du Bureau
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Bureau Directeur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Étage
                </label>
                <Input
                  type="number"
                  value={formData.floor ?? 1}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <Input
                  value={formData.telephone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  placeholder="06 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="bureau@example.com"
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
                  Cotisation Mensuelle (MAD)
                </label>
                <Input
                  type="number"
                  value={formData.cotisation ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, cotisation: parseFloat(e.target.value) || 0 })
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

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Notes
            </h3>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Ajouter des remarques ou informations supplémentaires..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}