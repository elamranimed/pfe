import { useData } from '@/context/DataContext';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentPayments } from '@/components/dashboard/RecentPayments';
import { DebtorsList } from '@/components/dashboard/DebtorsList';

export function Dashboard() {
  const { offices, tenants, payments, expenses } = useData();

  // Calculate stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalRevenueMTD = payments
    .filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === 'paid';
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpensesMTD = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.status === 'paid';
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const activeTenants = tenants.filter(t => t.status === 'active' || t.status === 'ending-soon').length;
  const outstandingDebts = tenants.reduce((sum, t) => sum + (t.balance < 0 ? Math.abs(t.balance) : 0), 0);
  
  const occupiedOffices = offices.filter(o => o.status === 'occupied').length;
  const occupancyRate = offices.length > 0 ? Math.round((occupiedOffices / offices.length) * 100) : 0;

  const stats = {
    totalRevenueMTD,
    totalExpensesMTD,
    activeTenants,
    outstandingDebts,
    occupancyRate
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      
      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPayments payments={payments} tenants={tenants} />
        <DebtorsList tenants={tenants} offices={offices} />
      </div>
    </div>
  );
}
