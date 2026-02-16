'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DelayBadge } from '@/components/delay-badge'
import { StatsCard } from '@/components/stats-card'
import { formatCurrency, calculateDaysLate } from '@/lib/utils'
import { generateCotisations, generateBureaus } from '@/lib/data'
import { MONTHS } from '@/lib/constants'
import { Cotisation } from '@/lib/types'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function ImpayésPage() {
  const [selectedMonth, setSelectedMonth] = useState('Tous')
  const [selectedBureau, setSelectedBureau] = useState('Tous')
  const cotisations = generateCotisations()
  const bureaus = generateBureaus()

  const unpaidCotisations = useMemo(() => {
    return cotisations.filter((cot) => cot.status !== 'Payé')
  }, [cotisations])

  const filteredUnpaid = useMemo(() => {
    return unpaidCotisations.filter((cot) => {
      const monthMatch = selectedMonth === 'Tous' || cot.month.toString() === selectedMonth
      const bureauMatch = selectedBureau === 'Tous' || cot.bureauNumber.toString() === selectedBureau
      return monthMatch && bureauMatch
    })
  }, [unpaidCotisations, selectedMonth, selectedBureau])

  // Group by month
  const unpaidByMonth = useMemo(() => {
    const grouped: Record<number, Cotisation[]> = {}
    filteredUnpaid.forEach((cot) => {
      if (!grouped[cot.month]) grouped[cot.month] = []
      grouped[cot.month].push(cot)
    })
    return grouped
  }, [filteredUnpaid])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUnpaid = unpaidCotisations.reduce((sum, c) => sum + c.amountDue, 0)
    const bureauCount = new Set(unpaidCotisations.map((c) => c.bureauNumber)).size
    const avgDelay = unpaidCotisations.length > 0
      ? Math.round(
          unpaidCotisations.reduce((sum, c) => sum + calculateDaysLate(c.month, c.year), 0) /
            unpaidCotisations.length
        )
      : 0

    // Find oldest unpaid
    const oldest = unpaidCotisations.reduce((min, c) => {
      const delay = calculateDaysLate(c.month, c.year)
      const minDelay = calculateDaysLate(min.month, min.year)
      return delay > minDelay ? c : min
    })

    return {
      totalUnpaid,
      bureauCount,
      avgDelay,
      oldestBureau: oldest.bureauId,
    }
  }, [unpaidCotisations])

  const handleMarkPaid = (cot: Cotisation) => {
    console.log('Mark as paid:', cot.bureauId, cot.month)
    // In a real app, this would update the state
  }

  const handleSendReminder = (cot: Cotisation) => {
    console.log('Send reminder:', cot.bureauId, cot.month)
    // In a real app, this would send an email/SMS
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impayés</h1>
        <p className="text-muted-foreground mt-2">Suivi des cotisations non payées</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Impayés"
          value={stats.totalUnpaid}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
        <StatsCard
          title="Nombre de Bureaux"
          value={stats.bureauCount}
          isCurrency={false}
        />
        <StatsCard
          title="Retard Moyen"
          value={`${stats.avgDelay} jours`}
          isCurrency={false}
        />
        <StatsCard
          title="Plus Ancien"
          value={stats.oldestBureau}
          isCurrency={false}
        />
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mois</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous</SelectItem>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
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

      {/* Unpaid Grouped by Month */}
      <Card>
        <CardHeader>
          <CardTitle>Impayés par Mois</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNum) => {
              const monthData = unpaidByMonth[monthNum] || []
              if (monthData.length === 0) return null

              const monthTotal = monthData.reduce((sum, c) => sum + c.amountDue, 0)
              const monthName = MONTHS[monthNum - 1]

              return (
                <AccordionItem key={monthNum} value={`month-${monthNum}`}>
                  <AccordionTrigger>
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <span className="font-semibold">
                        {monthName} 2025 - Total: {formatCurrency(monthTotal)} ({monthData.length} bureaux)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bureau</TableHead>
                            <TableHead>Locataire</TableHead>
                            <TableHead className="text-right">Montant Dû</TableHead>
                            <TableHead className="text-center">Jours de Retard</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthData.map((cot) => {
                            const daysLate = calculateDaysLate(cot.month, cot.year)
                            return (
                              <TableRow key={`${cot.bureauId}-${monthNum}`}>
                                <TableCell className="font-medium">{cot.bureauId}</TableCell>
                                <TableCell>{cot.locataire}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(cot.amountDue)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <DelayBadge daysLate={daysLate} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkPaid(cot)}
                                    >
                                      Marquer Payé
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSendReminder(cot)}
                                    >
                                      Envoyer Rappel
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
