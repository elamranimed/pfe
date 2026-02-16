'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Transaction } from '@/lib/types'
import { generateBureaus, generateCharges } from '@/lib/data'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

interface TransactionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Transaction) => void
}

export function TransactionSheet({
  open,
  onOpenChange,
  onSave,
}: TransactionSheetProps) {
  const [type, setType] = useState<'Cotisation' | 'Charge'>('Cotisation')
  const [date, setDate] = useState('')
  const [bureauId, setBureauId] = useState('')
  const [category, setCategory] = useState('Concierge')
  const [description, setDescription] = useState('')
  const [fournisseur, setFournisseur] = useState('')
  const [montant, setMontant] = useState('')

  const bureaus = generateBureaus()

  const handleSave = () => {
    if (!date || !montant) {
      alert('Date et montant sont obligatoires')
      return
    }

    if (type === 'Cotisation' && !bureauId) {
      alert('Bureau est obligatoire pour une cotisation')
      return
    }

    const amount = parseFloat(montant)
    const transaction: Transaction = {
      id: `TR${Date.now()}`,
      date,
      type,
      description:
        type === 'Cotisation'
          ? `Cotisation - Bureau ${bureauId}`
          : `${category} - ${description}`,
      debit: type === 'Charge' ? amount : 0,
      credit: type === 'Cotisation' ? amount : 0,
      balance: 0,
      bureauId: type === 'Cotisation' ? bureauId : undefined,
    }

    onSave(transaction)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ajouter Transaction</SheetTitle>
          <SheetDescription>Créer une nouvelle transaction</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type de Transaction *
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as any)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cotisation">Cotisation</SelectItem>
                <SelectItem value="Charge">Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Cotisation Fields */}
          {type === 'Cotisation' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bureau" className="text-sm font-medium">
                  Bureau *
                </Label>
                <Select value={bureauId} onValueChange={setBureauId}>
                  <SelectTrigger id="bureau">
                    <SelectValue placeholder="Sélectionner un bureau" />
                  </SelectTrigger>
                  <SelectContent>
                    {bureaus.map((bureau) => (
                      <SelectItem key={bureau.id} value={bureau.id}>
                        {bureau.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant-cot" className="text-sm font-medium">
                  Montant MAD *
                </Label>
                <Input
                  id="montant-cot"
                  type="number"
                  placeholder="0"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </>
          )}

          {/* Charge Fields */}
          {type === 'Charge' && (
            <>
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

              <div className="space-y-2">
                <Label htmlFor="fournisseur" className="text-sm font-medium">
                  Fournisseur
                </Label>
                <Input
                  id="fournisseur"
                  type="text"
                  placeholder="Nom du fournisseur"
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant-charge" className="text-sm font-medium">
                  Montant MAD *
                </Label>
                <Input
                  id="montant-charge"
                  type="number"
                  placeholder="0"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
