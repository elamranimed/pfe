'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover'
import { Label } from '@/app/components/ui/label'
import { Charge } from '@/app/lib/types'
import { EXPENSE_CATEGORIES, FOURNISSEURS } from '@/app/lib/constants'
import { Calendar } from 'lucide-react'
import { dateToFrench } from '@/app/lib/utils'

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  charge: Charge | null
  onSave: (charge: Charge) => void
}

export function ExpenseDialog({
  open,
  onOpenChange,
  charge,
  onSave,
}: ExpenseDialogProps) {
  const [date, setDate] = useState(charge?.date || '')
  const [category, setCategory] = useState(charge?.category || 'Concierge')
  const [description, setDescription] = useState(charge?.description || '')
  const [fournisseur, setFournisseur] = useState(charge?.fournisseur || '')
  const [montant, setMontant] = useState(charge?.amount.toString() || '')
  const [notes, setNotes] = useState(charge?.notes || '')
  const [customFournisseur, setCustomFournisseur] = useState('')

  const handleSave = () => {
    if (!date || !category || !description || !montant) {
      alert('Tous les champs obligatoires doivent être remplis')
      return
    }

    const newCharge: Charge = {
      id: charge?.id || `C${Date.now()}`,
      date,
      category: category as any,
      description,
      fournisseur: customFournisseur || fournisseur,
      amount: parseFloat(montant),
      notes,
    }

    onSave(newCharge)
  }

  // Simple date picker - user types DD/MM/YYYY
  const handleDateChange = (value: string) => {
    setDate(value)
  }

  const isEdit = !!charge

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier' : 'Ajouter'} Charge</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Mettre à jour les détails de la charge' : 'Créer une nouvelle charge'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date (DD/MM/YYYY) *
            </Label>
            <Input
              id="date"
              type="text"
              placeholder="DD/MM/YYYY"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Catégorie *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Salaire du gardien"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Fournisseur */}
          <div className="space-y-2">
            <Label htmlFor="fournisseur" className="text-sm font-medium">
              Fournisseur
            </Label>
            <Select value={fournisseur} onValueChange={setFournisseur}>
              <SelectTrigger id="fournisseur">
                <SelectValue placeholder="Sélectionner ou créer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {FOURNISSEURS.map((fourn) => (
                  <SelectItem key={fourn} value={fourn}>
                    {fourn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fournisseur === '' && (
              <Input
                type="text"
                placeholder="Ajouter un nouveau fournisseur..."
                value={customFournisseur}
                onChange={(e) => setCustomFournisseur(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="montant" className="text-sm font-medium">
              Montant MAD *
            </Label>
            <Input
              id="montant"
              type="number"
              placeholder="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Ajouter une note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>{isEdit ? 'Mettre à jour' : 'Ajouter'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
