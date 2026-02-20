import { Office, Payment, Expense } from './types';

const generateId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export const mockOffices: Office[] = [];
export const mockPayments: Payment[] = [];
export const mockExpenses: Expense[] = [];
