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
import { ExpenseDialog } from '@/app/components/expense-dialog'
import { formatCurrency, formatDate } from '@/app/lib/utils'
import { generateCharges } from '@/app/lib/data'
import { EXPENSE_CATEGORIES, MONTHS, FRENCH_MONTHS } from '@/app/lib/constants'
import { Charge } from '@/app/lib/types'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function ChargesPage() {
  const [selectedMonth, setSelectedMonth] = useState('0') // 0 = all
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [charges, setCharges] = useState<Charge[]>(generateCharges())
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const filteredCharges = useMemo(() => {
    return charges.filter((charge) => {
      const monthMatch = selectedMonth === '0' || charge.date.endsWith(`/0${selectedMonth}/2025`) || charge.date.endsWith(`/${parseInt(selectedMonth)}/2025`)
      const categoryMatch = selectedCategory === 'Tous' || charge.category === selectedCategory
      return monthMatch && categoryMatch
    })
  }, [charges, selectedMonth, selectedCategory])

  // Category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    EXPENSE_CATEGORIES.forEach((cat) => {
      totals[cat] = charges
        .filter((c) => c.category === cat && (selectedMonth === '0' || c.date.includes(`/0${selectedMonth}/`) || c.date.includes(`/${parseInt(selectedMonth)}/`)))
        .reduce((sum, c) => sum + c.amount, 0)
    })
    return totals
  }, [charges, selectedMonth])

  const totalExpenses = filteredCharges.reduce((sum, c) => sum + c.amount, 0)

  const handleAddCharge = () => {
    setEditingCharge(null)
    setShowDialog(true)
  }

  const handleEditCharge = (charge: Charge) => {
    setEditingCharge(charge)
    setShowDialog(true)
  }

  const handleDeleteCharge = (id: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSaveCharge = (charge: Charge) => {
    if (editingCharge) {
      setCharges((prev) => prev.map((c) => (c.id === charge.id ? charge : c)))
    } else {
      setCharges((prev) => [...prev, charge])
    }
    setShowDialog(false)
    setEditingCharge(null)
  }

  const displayMonth = selectedMonth === '0' ? 'Mois actuel' : FRENCH_MONTHS[parseInt(selectedMonth) - 1]

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charges</h1>
          <p className="text-muted-foreground mt-2">Gestion des dépenses de la copropriété</p>
        </div>
        <Button onClick={handleAddCharge} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter Charge
        </Button>
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
              <SelectItem value="0">Tous</SelectItem>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Catégorie</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {EXPENSE_CATEGORIES.map((category) => (
          <Card key={category} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setSelectedCategory(category)}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{category}</p>
                <p className="text-2xl font-bold">{formatCurrency(categoryTotals[category])}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions - {displayMonth}</CardTitle>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.length > 0 ? (
                  filteredCharges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">{formatDate(charge.date)}</TableCell>
                      <TableCell>{charge.category}</TableCell>
                      <TableCell>{charge.description}</TableCell>
                      <TableCell>{charge.fournisseur}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(charge.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCharge(charge)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCharge(charge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucune charge trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Dialog */}
      <ExpenseDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        charge={editingCharge}
        onSave={handleSaveCharge}
      />
    </div>
  )
}
