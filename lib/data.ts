import { Bureau, Cotisation, Charge, MonthlyBalance, Transaction } from './types'
import { BUREAU_LOCATAIRES, MONTHLY_AMOUNT_DEFAULT } from './constants'

// Generate all 37 bureaus
export function generateBureaus(): Bureau[] {
  const bureaus: Bureau[] = []
  for (let i = 1; i <= 37; i++) {
    bureaus.push({
      id: `BUREAU${i}`,
      number: i,
      locataire: BUREAU_LOCATAIRES[i] || `BUREAU${i}`,
    })
  }
  return bureaus
}

// Generate cotisations for all bureaus and months with realistic payment patterns
export function generateCotisations(): Cotisation[] {
  const cotisations: Cotisation[] = []
  const bureaus = generateBureaus()

  // Payment pattern: some paid, some unpaid, some partial
  // Bureaus with high payment rates
  const alwaysPaid = [1, 2, 3, 4, 5]
  // Bureaus with some unpaid
  const sometimesPaid = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  // Bureaus with frequent unpaid
  const neverPaid = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]

  for (const bureau of bureaus) {
    for (let month = 1; month <= 12; month++) {
      const amountDue = (month >= 4 && month <= 9) ? MONTHLY_AMOUNT_DEFAULT.aprToSep : MONTHLY_AMOUNT_DEFAULT.janFebMar

      let status: any = 'Payé'
      let paidDate = undefined
      let amountPaid = amountDue

      if (alwaysPaid.includes(bureau.number)) {
        status = 'Payé'
        paidDate = `${String(Math.floor(Math.random() * 25) + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/2025`
      } else if (sometimesPaid.includes(bureau.number)) {
        const rand = Math.random()
        if (rand < 0.6) {
          status = 'Payé'
          paidDate = `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/2025`
        } else if (rand < 0.8) {
          status = 'Non payé'
          amountPaid = 0
        } else {
          status = 'Partiel'
          amountPaid = Math.floor(amountDue * 0.75)
        }
      } else {
        const rand = Math.random()
        if (rand < 0.3) {
          status = 'Payé'
          paidDate = `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/2025`
        } else {
          status = 'Non payé'
          amountPaid = 0
        }
      }

      cotisations.push({
        bureauId: bureau.id,
        bureauNumber: bureau.number,
        locataire: bureau.locataire,
        month,
        year: 2025,
        amountDue,
        status,
        paidDate,
        amountPaid,
      })
    }
  }

  return cotisations
}

// Generate expenses with realistic patterns
export function generateCharges(): Charge[] {
  const charges: Charge[] = []
  let id = 1

  // Concierge - Salary, typically mid-month
  for (let month = 1; month <= 12; month++) {
    charges.push({
      id: `C${id++}`,
      date: `15/${String(month).padStart(2, '0')}/2025`,
      category: 'Concierge',
      description: 'Salaire du gardien',
      fournisseur: 'Ahmed',
      amount: 3500,
      notes: 'Paiement mensuel',
    })
  }

  // RADEEF - Water and electricity, typically month start
  for (let month = 1; month <= 12; month++) {
    charges.push({
      id: `C${id++}`,
      date: `05/${String(month).padStart(2, '0')}/2025`,
      category: 'Électricité & Eau',
      description: 'Facture RADEEF',
      fournisseur: 'RADEEF',
      amount: 800 + Math.random() * 400,
      notes: 'Consommation mensuelle',
    })
  }

  // Lift maintenance - OTIS
  for (let month of [2, 5, 8, 11]) {
    charges.push({
      id: `C${id++}`,
      date: `10/${String(month).padStart(2, '0')}/2025`,
      category: 'Ascenseur',
      description: 'Maintenance ascenseur',
      fournisseur: 'OTIS',
      amount: 1200,
      notes: 'Maintenance trimestrielle',
    })
  }

  // Cleaning supplies - Hafid
  for (let month of [1, 4, 7, 10]) {
    charges.push({
      id: `C${id++}`,
      date: `12/${String(month).padStart(2, '0')}/2025`,
      category: 'Fournitures & Ménage',
      description: 'Fournitures de nettoyage',
      fournisseur: 'Hafid',
      amount: 250 + Math.random() * 150,
      notes: 'Stock trimestriel',
    })
  }

  // Legal fees - Notaire
  charges.push({
    id: `C${id++}`,
    date: '20/01/2025',
    category: 'Autres',
    description: 'Frais de notaire',
    fournisseur: 'Notaire',
    amount: 500,
    notes: 'Frais d\'immatriculation',
  })

  return charges
}

export function generateMonthlyBalances(): MonthlyBalance[] {
  return [
    { month: 1, year: 2025, openingBalance: 0, credits: 8600, debits: 5524.33, closingBalance: 3075.67 },
    { month: 2, year: 2025, openingBalance: 3075.67, credits: 5600, debits: 4454.61, closingBalance: 4221.06 },
    { month: 3, year: 2025, openingBalance: 4221.06, credits: 7200, debits: 5200.15, closingBalance: 6220.91 },
    { month: 4, year: 2025, openingBalance: 6220.91, credits: 9250, debits: 6150.42, closingBalance: 9320.49 },
    { month: 5, year: 2025, openingBalance: 9320.49, credits: 8950, debits: 5875.63, closingBalance: 12394.86 },
    { month: 6, year: 2025, openingBalance: 12394.86, credits: 9100, debits: 7200.25, closingBalance: 14294.61 },
    { month: 7, year: 2025, openingBalance: 14294.61, credits: 8800, debits: 6500.80, closingBalance: 16593.81 },
    { month: 8, year: 2025, openingBalance: 16593.81, credits: 9200, debits: 5900.45, closingBalance: 19893.36 },
    { month: 9, year: 2025, openingBalance: 19893.36, credits: 8950, debits: 7300.22, closingBalance: 21543.14 },
    { month: 10, year: 2025, openingBalance: 21543.14, credits: 7400, debits: 6200.65, closingBalance: 22742.49 },
    { month: 11, year: 2025, openingBalance: 22742.49, credits: 7200, debits: 5800.33, closingBalance: 24142.16 },
    { month: 12, year: 2025, openingBalance: 24142.16, credits: 9350, debits: 27495.03, closingBalance: 5997.13 },
  ]
}

// Generate recent transactions for dashboard
export function generateRecentTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  let id = 1

  // Add sample transactions from recent months
  const charges = generateCharges()
  const cotisations = generateCotisations()

  const lastCharges = charges.slice(-5).reverse()
  for (const charge of lastCharges) {
    transactions.push({
      id: `TR${id++}`,
      date: charge.date,
      type: 'Charge',
      description: `${charge.category} - ${charge.description}`,
      debit: charge.amount,
      credit: 0,
      balance: 0, // Will be calculated
      chargeId: charge.id,
    })
  }

  // Some paid cotisations as credits
  const paidCotisations = cotisations
    .filter((c) => c.status === 'Payé' && c.paidDate)
    .sort((a, b) => {
      const dateA = a.paidDate || ''
      const dateB = b.paidDate || ''
      return dateB.localeCompare(dateA)
    })
    .slice(0, 5)

  for (const cot of paidCotisations) {
    transactions.push({
      id: `TR${id++}`,
      date: cot.paidDate || '',
      type: 'Cotisation',
      description: `Cotisation - Bureau ${cot.bureauNumber} (${cot.locataire})`,
      debit: 0,
      credit: cot.amountPaid || 0,
      balance: 0,
      bureauId: cot.bureauId,
    })
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date))
}

// Get total revenues for year
export function getTotalAnnualRevenue(): number {
  const cotisations = generateCotisations()
  return cotisations
    .filter((c) => c.status === 'Payé')
    .reduce((sum, c) => sum + (c.amountPaid || 0), 0)
}

// Get total expenses for year
export function getTotalAnnualExpenses(): number {
  const charges = generateCharges()
  return charges.reduce((sum, c) => sum + c.amount, 0)
}

// Get active bureaus (those with payment)
export function getActiveBureaus(): number {
  const cotisations = generateCotisations()
  const paid = new Set(cotisations.filter((c) => c.status === 'Payé').map((c) => c.bureauNumber))
  return paid.size
}

// Get total unpaid amount
export function getTotalUnpaid(): number {
  const cotisations = generateCotisations()
  return cotisations
    .filter((c) => c.status === 'Non payé')
    .reduce((sum, c) => sum + c.amountDue, 0)
}

// Get monthly totals
export function getMonthlyTotals(month: number) {
  const cotisations = generateCotisations()
  const balances = generateMonthlyBalances()
  const balance = balances.find((b) => b.month === month) || { credits: 0, debits: 0, closingBalance: 0 }

  const monthCotisations = cotisations.filter((c) => c.month === month && c.status === 'Payé')
  const revenue = monthCotisations.reduce((sum, c) => sum + (c.amountPaid || 0), 0)

  return {
    revenue: revenue || balance.credits,
    expenses: balance.debits,
    balance: balance.closingBalance
  }
}
