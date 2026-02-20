'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Building, AlertCircle, LogOut } from 'lucide-react';
import { mockOffices, mockPayments, mockExpenses } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = mockExpenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const occupiedOffices = mockOffices.filter(
    (o) => o.status === 'occupied'
  ).length;

  const totalDebt = mockOffices
    .filter((o) => o.tenant && o.tenant.balance < 0)
    .reduce((sum, o) => sum + (o.tenant?.balance || 0), 0);

  
  const recentPayments = mockPayments.slice(-5).reverse();

 
  const officesWithDebt = mockOffices
    .filter((o) => o.tenant && o.tenant.balance < 0)
    .map((o, idx) => ({
      officeNumber: o.number,
      tenantName: o.tenant?.companyName || '',
      amount: Math.abs(o.tenant?.balance || 0),
      daysOverdue: (idx + 1) * 5 + 10,
    }));

  const getPaymentTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      contribution: { label: 'Cotisation', variant: 'default' },
      charges: { label: 'Charges', variant: 'secondary' },
      penalty: { label: 'Pénalité', variant: 'destructive' },
    };
    return types[type] || { label: type, variant: 'default' };
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-700">Payé</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-700">En Attente</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header avec bouton de déconnexion */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Tableau de Bord
            </h1>
            <p className="text-slate-600">
              Aperçu de la gestion de votre bâtiment
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Revenus Totaux (Ce Mois)
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Dépenses Totales (Ce Mois)
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Bureaux Occupés
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {occupiedOffices}/{mockOffices.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Dettes Impayées
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(Math.abs(totalDebt))}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Paiements Récents
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-700">Date</TableHead>
                  <TableHead className="text-slate-700">Bureau N°</TableHead>
                  <TableHead className="text-slate-700">Locataire</TableHead>
                  <TableHead className="text-slate-700">Montant</TableHead>
                  <TableHead className="text-slate-700">Type</TableHead>
                  <TableHead className="text-slate-700">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => {
                  const typeBadge = getPaymentTypeBadge(payment.type);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium">
                        {payment.officeNumber}
                      </TableCell>
                      <TableCell>{payment.tenantName}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeBadge.variant as any}>
                          {typeBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Offices with Unpaid Debts */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Bureaux avec Dettes Impayées
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-700">Bureau N°</TableHead>
                  <TableHead className="text-slate-700">Locataire</TableHead>
                  <TableHead className="text-slate-700">Montant Dû</TableHead>
                  <TableHead className="text-slate-700">Jours de Retard</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officesWithDebt.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {item.officeNumber}
                    </TableCell>
                    <TableCell>{item.tenantName}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>{item.daysOverdue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
