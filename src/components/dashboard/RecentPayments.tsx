import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type Payment, type Tenant } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

export function RecentPayments({ payments, tenants }: { payments: Payment[], tenants: Tenant[] }) {
  const sortedPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.companyName || 'Inconnu';

  return (
    <div className="rounded-md border bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Paiements Récents</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Locataire</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Référence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.date)}</TableCell>
              <TableCell className="font-medium">{getTenantName(payment.tenantId)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {payment.type}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="text-muted-foreground">{payment.reference}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
