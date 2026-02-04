import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Office, Tenant, Payment, Expense } from '../types';
import { mockOffices, mockTenants, mockPayments, mockExpenses } from '../data/mockData';

interface DataContextType {
  offices: Office[];
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  addOffice: (office: Office) => void;
  updateOffice: (id: string, office: Partial<Office>) => void;
  deleteOffice: (id: string) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [offices, setOffices] = useState<Office[]>(() => {
    const saved = localStorage.getItem('offices');
    return saved ? JSON.parse(saved) : mockOffices;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('tenants');
    return saved ? JSON.parse(saved) : mockTenants;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : mockPayments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : mockExpenses;
  });

  useEffect(() => {
    localStorage.setItem('offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addOffice = (office: Office) => setOffices([...offices, office]);
  const updateOffice = (id: string, updated: Partial<Office>) =>
    setOffices(offices.map((o) => (o.id === id ? { ...o, ...updated } : o)));
  const deleteOffice = (id: string) => setOffices(offices.filter((o) => o.id !== id));

  const addTenant = (tenant: Tenant) => setTenants([...tenants, tenant]);
  const updateTenant = (id: string, updated: Partial<Tenant>) =>
    setTenants(tenants.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  const deleteTenant = (id: string) => setTenants(tenants.filter((t) => t.id !== id));

  const addPayment = (payment: Payment) => setPayments([...payments, payment]);
  const updatePayment = (id: string, updated: Partial<Payment>) =>
    setPayments(payments.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  const deletePayment = (id: string) => setPayments(payments.filter((p) => p.id !== id));

  const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
  const updateExpense = (id: string, updated: Partial<Expense>) =>
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  const deleteExpense = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  return (
    <DataContext.Provider
      value={{
        offices,
        tenants,
        payments,
        expenses,
        addOffice,
        updateOffice,
        deleteOffice,
        addTenant,
        updateTenant,
        deleteTenant,
        addPayment,
        updatePayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
