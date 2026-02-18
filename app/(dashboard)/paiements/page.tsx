'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { StatusBadge } from '@/app/components/status-badge'
import { PaymentDialog } from '@/app/components/payment-dialog'
import { formatCurrency } from '@/app/lib/utils'
import { generateCotisations, generateBureaus } from '@/app/lib/data'
import { MONTHS } from '@/app/lib/constants'
import { Cotisation } from '@/app/lib/types'
import { Download } from 'lucide-react'

export default function RévenusPage() {
  const [selectedStatus, setSelectedStatus] = useState('Tous')
  const [selectedBureau, setSelectedBureau] = useState('Tous')
  const [cotisations, setCotisations] = useState<Cotisation[]>(generateCotisations())
  const [editingCotisation, setEditingCotisation] = useState<Cotisation | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const bureaus = generateBureaus()

  const filteredCotisations = useMemo(() => {
    return cotisations.filter((cot) => {
      const statusMatch = selectedStatus === 'Tous' || cot.status === selectedStatus
      const bureauMatch = selectedBureau === 'Tous' || cot.bureauNumber.toString() === selectedBureau
      return statusMatch && bureauMatch
    })
  }, [cotisations, selectedStatus, selectedBureau])

  const handleEditPayment = (cotisation: Cotisation) => {
    setEditingCotisation(cotisation)
    setShowDialog(true)
  }

  const handleSavePayment = (updated: Cotisation) => {
    setCotisations((prev) =>
      prev.map((cot) =>
        cot.bureauId === updated.bureauId && cot.month === updated.month ? updated : cot
      )
    )
    setShowDialog(false)
    setEditingCotisation(null)
  }

  // Calculate monthly totals
  const monthlyTotals = Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1
    const monthCotisations = cotisations.filter((c) => c.month === month)
    const total = monthCotisations.reduce((sum, c) => sum + (c.amountPaid || 0), 0)
    const paid = monthCotisations.filter((c) => c.status === 'Payé').length
    return { month, total, paid, count: monthCotisations.length }
  })

  const annualTotal = cotisations.reduce((sum, c) => sum + (c.amountPaid || 0), 0)

  const handleExportCSV = () => {
    let csv = 'Bureau,Locataire,' + MONTHS.join(',') + ',Total Annuel\n'
    for (const bureau of bureaus) {
      const row = [bureau.id, bureau.locataire]
      let bureauTotal = 0
      for (let month = 1; month <= 12; month++) {
        const cot = cotisations.find((c) => c.bureauId === bureau.id && c.month === month)
        const amount = cot?.amountPaid || 0
        row.push(amount.toString())
        bureauTotal += amount
      }
      row.push(bureauTotal.toString())
      csv += row.join(',') + '\n'
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'revenus-2025.csv'
    a.click()
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenus</h1>
          <p className="text-muted-foreground mt-2">Suivi des cotisations par bureau</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Statut</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous</SelectItem>
              <SelectItem value="Payé">Payé</SelectItem>
              <SelectItem value="Non payé">Non payé</SelectItem>
              <SelectItem value="En cours">En cours</SelectItem>
              <SelectItem value="Partiel">Partiel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bureau</label>
          <Select value={selectedBureau} onValueChange={setSelectedBureau}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous</SelectItem>
              {bureaus.map((bureau) => (
                <SelectItem key={bureau.id} value={bureau.number.toString()}>
                  {bureau.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tableau des Revenus 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background">Bureau</TableHead>
                  <TableHead className="sticky left-16 z-10 bg-background sm:left-20">Locataire</TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month} className="text-center min-w-20">
                      {month.substring(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right min-w-24">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bureaus.map((bureau) => {
                  const bureauCotisations = cotisations.filter((c) => c.bureauId === bureau.id)
                  const bureauTotal = bureauCotisations.reduce((sum, c) => sum + (c.amountPaid || 0), 0)

                  return (
                    <TableRow key={bureau.id}>
                      <TableCell className="sticky left-0 z-10 bg-background font-medium">
                        {bureau.id}
                      </TableCell>
                      <TableCell className="sticky left-16 z-10 bg-background sm:left-20 text-xs">
                        {bureau.locataire}
                      </TableCell>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                        const cot = cotisations.find(
                          (c) => c.bureauId === bureau.id && c.month === month
                        )
                        return (
                          <TableCell
                            key={`${bureau.id}-${month}`}
                            className="cursor-pointer hover:bg-accent p-2 text-center"
                            onClick={() => cot && handleEditPayment(cot)}
                          >
                            <div className="space-y-1">
                              <StatusBadge status={cot?.status || 'Non payé'} className="text-xs" />
                              <div className="text-xs font-semibold">{formatCurrency(cot?.amountPaid || 0)}</div>
                            </div>
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-right font-semibold min-w-24">
                        {formatCurrency(bureauTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* Monthly Totals Row */}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={2}>Total Mensuel</TableCell>
                  {monthlyTotals.map(({ month, total, paid, count }) => (
                    <TableCell key={`total-${month}`} className="text-center">
                      <div className="space-y-1">
                        <div className="text-xs">{paid}/{count}</div>
                        <div className="text-xs font-semibold">{formatCurrency(total)}</div>
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    {formatCurrency(annualTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {editingCotisation && (
        <PaymentDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          cotisation={editingCotisation}
          onSave={handleSavePayment}
        />
      )}
    </div>
  )
}
