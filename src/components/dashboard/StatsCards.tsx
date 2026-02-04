import { TrendingUp, TrendingDown, Users, AlertCircle, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", color)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  totalRevenueMTD: number;
  totalExpensesMTD: number;
  activeTenants: number;
  outstandingDebts: number;
  occupancyRate: number;
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Revenus MTD"
        value={formatCurrency(stats.totalRevenueMTD)}
        icon={TrendingUp}
        color="bg-green-600"
      />
      <StatCard
        title="Dépenses MTD"
        value={formatCurrency(stats.totalExpensesMTD)}
        icon={TrendingDown}
        color="bg-red-600"
      />
      <StatCard
        title="Locataires Actifs"
        value={stats.activeTenants}
        icon={Users}
        color="bg-blue-600"
      />
      <StatCard
        title="Dettes Impayées"
        value={formatCurrency(stats.outstandingDebts)}
        icon={AlertCircle}
        color="bg-orange-500"
      />
      <StatCard
        title="Taux d'occupation"
        value={`${stats.occupancyRate}%`}
        icon={Building}
        color="bg-purple-600"
      />
    </div>
  );
}
