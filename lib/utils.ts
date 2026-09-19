import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with space thousands separator and 2 decimal places with dot:
 * e.g. 00.00 | 000.00 | 0 000.00 | 00 000.00 | 000 000.00 | 0 000 000.00
 */
export function formatNumber(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
  if (isNaN(num)) return '0.00';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  
  // Format integer part with spaces every 3 digits
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return (isNegative ? '-' : '') + parts.join('.');
}

/**
 * Formats monetary amounts with the requested number format followed by ' DH'
 * e.g. 1 250.00 DH
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  return `${formatNumber(amount)} DH`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

import * as XLSX from 'xlsx';

export function exportToXLSX(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
