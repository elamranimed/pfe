'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { StatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  getTotalAnnualRevenue,
  getTotalAnnualExpenses,
  getActiveBureaus,
  generateRecentTransactions,
} from '@/lib/data'
import { DollarSign, Zap, TrendingUp, Building2 } from 'lucide-react'

export default function HomePage() {
  const totalRevenue = getTotalAnnualRevenue()
  const totalExpenses = getTotalAnnualExpenses()
  const activeBureaus = getActiveBureaus()
  const recentTransactions = generateRecentTransactions().slice(0, 5)
  const netResult = totalRevenue - totalExpenses

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accueil</h1>
        <p className="text-muted-foreground mt-2">Aperçu financier 2025</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenus 2025"
          value={totalRevenue}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Charges"
          value={totalExpenses}
          icon={<Zap className="h-4 w-4" />}
        />
        <StatsCard
          title="Résultat Net"
          value={netResult}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Bureaux Actifs"
          value={activeBureaus}
          isCurrency={false}
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Débit</TableHead>
                  <TableHead className="text-right">Crédit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.type} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
