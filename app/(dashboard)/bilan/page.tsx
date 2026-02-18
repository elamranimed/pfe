'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { StatsCard } from '@/app/components/stats-card'
import { RevenueExpenseChart } from '@/app/components/revenue-expense-chart'
import { formatCurrency } from '@/app/lib/utils'
import {
  getTotalAnnualRevenue,
  getTotalAnnualExpenses,
  generateMonthlyBalances,
} from '@/app/lib/data'
import { FRENCH_MONTHS } from '@/app/lib/constants'
import { Download, FileText } from 'lucide-react'

export default function BilanPage() {
  const totalRevenue = getTotalAnnualRevenue()
  const totalExpenses = getTotalAnnualExpenses()
  const netResult = totalRevenue - totalExpenses
  const collectionRate = totalRevenue > 0 ? ((totalRevenue / (37 * 12 * 250)) * 100).toFixed(1) : '0'
  const monthlyBalances = generateMonthlyBalances()

  const handleExportPDF = () => {
    console.log('Exporting PDF...')
    // In a real app, this would generate and download a PDF
  }

  const handleExportExcel = () => {
    console.log('Exporting Excel...')
    // In a real app, this would generate and download an Excel file
  }

  // Prepare chart data
  const chartData = monthlyBalances.map((balance) => ({
    month: FRENCH_MONTHS[balance.month - 1].substring(0, 3),
    revenue: balance.credits,
    expenses: balance.debits,
  }))

  const averageExpense = totalExpenses / 12

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bilan Annuel 2025</h1>
          <p className="text-muted-foreground mt-2">Rapport financier complet</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenus"
          value={totalRevenue}
        />
        <StatsCard
          title="Total Charges"
          value={totalExpenses}
        />
        <StatsCard
          title="Résultat Net"
          value={netResult}
        />
        <StatsCard
          title="Taux de Collecte"
          value={`${collectionRate}%`}
          isCurrency={false}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Charges par Mois</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueExpenseChart data={chartData} />
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-right">Solde Ouverture</TableHead>
                  <TableHead className="text-right">Revenus</TableHead>
                  <TableHead className="text-right">Dépenses</TableHead>
                  <TableHead className="text-right">Résultat</TableHead>
                  <TableHead className="text-right">Solde Clôture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBalances.map((balance) => {
                  const result = balance.credits - balance.debits
                  const isPositive = result >= 0

                  return (
                    <TableRow key={balance.month}>
                      <TableCell className="font-medium">
                        {FRENCH_MONTHS[balance.month - 1]}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(balance.openingBalance)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(balance.credits)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(balance.debits)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(result)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(balance.closingBalance)}
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* Totals Row */}
                <TableRow className="bg-muted/50 font-semibold border-t-2">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(totalExpenses)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(netResult)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyBalances[11]?.closingBalance || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dépense Moyenne Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(averageExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mois le Plus Actif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {FRENCH_MONTHS[
                monthlyBalances.reduce((max, b) => (b.credits > max.credits ? b : max)).month - 1
              ]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bilan Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyBalances[11]?.closingBalance || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
