'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Cotisation } from '@/lib/types'
import { formatCurrency, dateToFrench } from '@/lib/utils'
import { MONTHS } from '@/lib/constants'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cotisation: Cotisation
  onSave: (cotisation: Cotisation) => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  cotisation,
  onSave,
}: PaymentDialogProps) {
  const [status, setStatus] = useState(cotisation.status)
  const [montant, setMontant] = useState(cotisation.amountPaid?.toString() || '0')
  const [paidDate, setPaidDate] = useState(cotisation.paidDate || '')
  const [notes, setNotes] = useState(cotisation.notes || '')

  const handleSave = () => {
    const updated: Cotisation = {
      ...cotisation,
      status: status as any,
      amountPaid: parseFloat(montant) || 0,
      paidDate: status === 'Payé' ? paidDate : undefined,
      notes,
    }
    onSave(updated)
  }

  const monthName = MONTHS[cotisation.month - 1]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier Paiement</DialogTitle>
          <DialogDescription>
            {cotisation.bureauId} - {cotisation.locataire} • {monthName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Statut
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Payé">Payé</SelectItem>
                <SelectItem value="Non payé">Non payé</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Partiel">Partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="montant" className="text-sm font-medium">
              Montant Payé ({formatCurrency(cotisation.amountDue)} attendu)
            </Label>
            <Input
              id="montant"
              type="number"
              placeholder="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              min="0"
            />
          </div>

          {/* Paid Date */}
          {status === 'Payé' && (
            <div className="space-y-2">
              <Label htmlFor="paidDate" className="text-sm font-medium">
                Date de Paiement (DD/MM/YYYY)
              </Label>
              <Input
                id="paidDate"
                type="text"
                placeholder="DD/MM/YYYY"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </div>
          )}

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
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
