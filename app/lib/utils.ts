import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FRENCH_MONTHS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// French currency formatting: 1 234,56 MAD
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return formatted
}

// French date formatting: DD/MM/YYYY
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  // Try to parse as ISO format (YYYY-MM-DD) first
  let date = new Date(dateString)
  
  // If invalid and contains slashes, try parsing as DD/MM/YYYY or DD/0M/YYYY
  if (isNaN(date.getTime()) && dateString.includes('/')) {
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      date = new Date(year, month - 1, day)
    }
  }
  
  // If still invalid, return empty string
  if (isNaN(date.getTime())) return ''
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// Parse French date (DD/MM/YYYY) to Date object
export function parseFrenchDate(dateString: string): Date | null {
  const [day, month, year] = dateString.split('/')
  if (!day || !month || !year) return null
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

// Format date object to string DD/MM/YYYY
export function dateToFrench(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Get French month name from number (1-12)
export function getMonthName(monthNumber: number): string {
  return FRENCH_MONTHS[monthNumber - 1] || ''
}

// Calculate days late from payment deadline (5th of month)
export function calculateDaysLate(month: number, year: number): number {
  const deadline = new Date(year, month - 1, 5)
  const today = new Date()
  const diffTime = today.getTime() - deadline.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Payé':
      return 'bg-green-100 text-green-800'
    case 'Non payé':
      return 'bg-red-100 text-red-800'
    case 'En cours':
      return 'bg-blue-100 text-blue-800'
    case 'Partiel':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get delay color based on days late
export function getDelayColor(daysLate: number): string {
  if (daysLate > 60) return 'bg-red-100 text-red-800'
  if (daysLate > 30) return 'bg-orange-100 text-orange-800'
  return 'bg-yellow-100 text-yellow-800'
}

// Calculate delay text
export function getDelayText(daysLate: number): string {
  if (daysLate === 0) return 'À jour'
  return `${daysLate} jour${daysLate > 1 ? 's' : ''}`
}
