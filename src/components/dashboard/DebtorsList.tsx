import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type Tenant, type Office } from '@/types';
import { formatCurrency, calculateDaysOverdue } from '@/lib/utils';

export function DebtorsList({ tenants, offices }: { tenants: Tenant[], offices: Office[] }) {
  const debtors = tenants.filter(t => t.balance < 0);

  const getOfficeNumber = (officeId: string) => offices.find(o => o.id === officeId)?.number || 'N/A';

  return (
    <div className="rounded-md border bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-red-600">Dettes Impayées</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Locataire</TableHead>
            <TableHead>Bureau</TableHead>
            <TableHead>Montant Dû</TableHead>
            <TableHead>Retard (Jours)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debtors.map((tenant) => {
            const daysOverdue = calculateDaysOverdue(tenant.contractStart); // Simplified logic
            return (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.companyName}</TableCell>
                <TableCell>{getOfficeNumber(tenant.officeId)}</TableCell>
                <TableCell className="text-red-600 font-bold">
                  {formatCurrency(Math.abs(tenant.balance))}
                </TableCell>
                <TableCell>
                  <Badge variant={daysOverdue > 30 ? "destructive" : "secondary"}>
                    {daysOverdue} jours
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
