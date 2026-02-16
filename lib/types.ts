// Building Management System Types

export type PaymentStatus = 'Payé' | 'Non payé' | 'En cours' | 'Partiel';
export type ExpenseCategory = 'Concierge' | 'Électricité & Eau' | 'Ascenseur' | 'Fournitures & Ménage' | 'Autres';
export type TransactionType = 'Cotisation' | 'Charge';

export interface Bureau {
  id: string;
  number: number;
  locataire: string;
}

export interface Payment {
  month: number; // 1-12
  year: number;
  amount: number;
  status: PaymentStatus;
  paidDate?: string; // DD/MM/YYYY
  amountPaid?: number; // For "Partiel"
  notes?: string;
}

export interface Cotisation {
  bureauId: string;
  bureauNumber: number;
  locataire: string;
  month: number;
  year: number;
  amountDue: number;
  status: PaymentStatus;
  paidDate?: string;
  amountPaid?: number;
  notes?: string;
}

export interface Charge {
  id: string;
  date: string; // DD/MM/YYYY
  category: ExpenseCategory;
  description: string;
  fournisseur: string;
  amount: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string; // DD/MM/YYYY
  type: TransactionType;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  bureauId?: string;
  chargeId?: string;
}

export interface MonthlyBalance {
  month: number;
  year: number;
  openingBalance: number;
  credits: number;
  debits: number;
  closingBalance?: number;
}
