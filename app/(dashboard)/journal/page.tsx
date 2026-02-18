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
import { TransactionSheet } from '@/app/components/transaction-sheet'
import { formatCurrency, formatDate } from '@/app/lib/utils'
import { generateMonthlyBalances, generateRecentTransactions } from '@/app/lib/data'
import { MONTHS, FRENCH_MONTHS } from '@/app/lib/constants'
import { Transaction, MonthlyBalance } from '@/app/lib/types'
import { Plus } from 'lucide-react'

export default function JournalPage() {
  const [selectedMonth, setSelectedMonth] = useState('12') // December by default
  const [transactions, setTransactions] = useState<Transaction[]>(generateRecentTransactions())
  const [showSheet, setShowSheet] = useState(false)
  const monthlyBalances = generateMonthlyBalances()

  const selectedBalance = monthlyBalances.find((b) => b.month === parseInt(selectedMonth))

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const parts = t.date.split('/')
        return parts[1] === String(parseInt(selectedMonth)).padStart(2, '0')
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedMonth])

  // Calculate running balance for month
  const transactionsWithBalance = useMemo(() => {
    let running = selectedBalance?.openingBalance || 0
    return monthTransactions.map((t) => {
      running = running - t.debit + t.credit
      return { ...t, balance: running }
    })
  }, [monthTransactions, selectedBalance])

  const currentMonth = parseInt(selectedMonth)
  const monthName = FRENCH_MONTHS[currentMonth - 1]
  const monthNameUpper = MONTHS[currentMonth - 1]

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [...prev, newTransaction])
    setShowSheet(false)
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">État Journalier</h1>
          <p className="text-muted-foreground mt-2">Suivi quotidien des transactions</p>
        </div>
        <Button onClick={() => setShowSheet(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter Transaction
        </Button>
      </div>

      {/* Month Selector */}
      <div className="max-w-xs">
        <label className="text-sm font-medium">Sélectionner un mois</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, idx) => (
              <SelectItem key={idx} value={(idx + 1).toString()}>
                {month} 2025
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Balance Card */}
      {selectedBalance && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Solde Actuel - {monthName}</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(selectedBalance.closingBalance)}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Crédits</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedBalance.credits)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Débits</p>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedBalance.debits)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Solde Ouverture</p>
                  <p className="font-semibold">{formatCurrency(selectedBalance.openingBalance)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions - {monthNameUpper} 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Débit</TableHead>
                  <TableHead className="text-right">Crédit</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Opening Balance Row */}
                {selectedBalance && (
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={5} className="font-semibold">
                      Solde d&apos;ouverture
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(selectedBalance.openingBalance)}
                    </TableCell>
                  </TableRow>
                )}

                {/* Transactions */}
                {transactionsWithBalance.length > 0 ? (
                  transactionsWithBalance.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(transaction.balance)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucune transaction ce mois
                    </TableCell>
                  </TableRow>
                )}

                {/* Monthly Summary */}
                {selectedBalance && (
                  <>
                    <TableRow className="bg-muted/50 border-t-2">
                      <TableCell colSpan={5} className="font-semibold">
                        Résumé {monthNameUpper}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(selectedBalance.closingBalance)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell className="text-xs">Total Débits</TableCell>
                      <TableCell colSpan={4} className="text-right">
                        {formatCurrency(selectedBalance.debits)}
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell className="text-xs">Total Crédits</TableCell>
                      <TableCell colSpan={4} className="text-right">
                        {formatCurrency(selectedBalance.credits)}
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell className="text-xs font-semibold">
                        Résultat (Crédits - Débits)
                      </TableCell>
                      <TableCell colSpan={4} className="text-right">
                        <span className={selectedBalance.credits - selectedBalance.debits >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(selectedBalance.credits - selectedBalance.debits)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Sheet */}
      <TransactionSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        onSave={handleAddTransaction}
      />
    </div>
  )
}
