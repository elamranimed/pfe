import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment } from '@/types';

export function Payments() {
  const { payments, tenants, addPayment, updatePayment, deletePayment, updateTenant } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    const now = new Date();
    const d = new Date(p.date);
    if (filter === '30') return (now.getTime() - d.getTime()) <= (30 * 24 * 60 * 60 * 1000);
    if (filter === '90') return (now.getTime() - d.getTime()) <= (90 * 24 * 60 * 60 * 1000);
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCollected = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.companyName || 'Inconnu';

  const handleAdd = () => {
    setCurrentPayment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDialogOpen(true);
  };

  const handleSave = (payment: Payment) => {
    if (currentPayment) {
      // If amount changed or status changed to paid, update tenant balance
      const tenant = tenants.find(t => t.id === payment.tenantId);
      if (tenant) {
        const diff = payment.amount - currentPayment.amount;
        updateTenant(tenant.id, { balance: tenant.balance + diff });
      }
      updatePayment(payment.id, payment);
    } else {
      addPayment(payment);
      if (payment.status === 'paid') {
        const tenant = tenants.find(t => t.id === payment.tenantId);
        if (tenant) {
          updateTenant(tenant.id, { balance: tenant.balance + payment.amount });
        }
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      const payment = payments.find(p => p.id === id);
      if (payment && payment.status === 'paid') {
        const tenant = tenants.find(t => t.id === payment.tenantId);
        if (tenant) {
          updateTenant(tenant.id, { balance: tenant.balance - payment.amount });
        }
      }
      deletePayment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-64">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Derniers 30 jours</SelectItem>
              <SelectItem value="90">Derniers 3 mois</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="py-4 flex items-center justify-between space-x-4">
            <span className="text-sm text-muted-foreground font-medium">Total collecté:</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalCollected)}</span>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Locataire</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell className="font-medium">{getTenantName(payment.tenantId)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {payment.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{payment.reference}</TableCell>
                <TableCell>
                  <Badge 
                    className={payment.status === 'paid' ? "bg-green-600" : "bg-yellow-500"}
                  >
                    {payment.status === 'paid' ? 'Payé' : 'En attente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(payment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(payment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaymentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        payment={currentPayment}
        tenants={tenants}
        onSave={handleSave}
      />
    </div>
  );
}
