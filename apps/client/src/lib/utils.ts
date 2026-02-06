import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => 
  `${amount.toLocaleString('fr-MA')} MAD`;

export const formatDate = (date: string) => 
  format(new Date(date), 'dd/MM/yyyy');

export const calculateDaysOverdue = (dueDate: string) => {
  const days = differenceInDays(new Date(), new Date(dueDate));
  return days > 0 ? days : 0;
};
