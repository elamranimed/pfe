'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { PaymentsTable } from '@/components/payments-table';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPayments } from '@/lib/mock-data';
import { Payment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type FilterPeriod = 'this-month' | 'three-months' | 'all';

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('this-month');

  const getFilteredPayments = () => {
    const now = new Date();
    const payments_sorted = [...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (filterPeriod === 'this-month') {
      return payments_sorted.filter((p) => {
        const paymentDate = new Date(p.date);
        return (
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filterPeriod === 'three-months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return payments_sorted.filter(
        (p) => new Date(p.date) >= threeMonthsAgo
      );
    }
    return payments_sorted;
  };

  const filteredPayments = getFilteredPayments();
  const totalCollected = filteredPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = (newPayment: Payment) => {
    setPayments([...payments, newPayment]);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Paiements
          </h1>
          <p className="text-slate-600">
            Gestion des paiements des loyers et charges
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Période:</span>
              <Select
                value={filterPeriod}
                onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Ce Mois</SelectItem>
                  <SelectItem value="three-months">3 Derniers Mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Collecté</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalCollected)}
              </p>
            </div>
          </div>

          <PaymentsTable
            payments={filteredPayments}
            onAddPayment={handleAddPayment}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
