import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import type { Payment } from '@/types';

export function TenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenants, offices, payments, addPayment, updateTenant } = useData();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const tenant = tenants.find(t => t.id === id);
  const office = offices.find(o => o.id === tenant?.officeId);
  const tenantPayments = payments.filter(p => p.tenantId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!tenant) return <div>Locataire non trouvé</div>;

  const handleAddPayment = (payment: Payment) => {
    addPayment(payment);
    if (payment.status === 'paid') {
      updateTenant(tenant.id, { balance: tenant.balance + payment.amount });
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/tenants')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux locataires
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations du locataire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{tenant.companyName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Contrat: {formatDate(tenant.contractStart)} - {formatDate(tenant.contractEnd)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.phone}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Bureau assigné</h4>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span>Bureau {office?.number} ({office?.type})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solde du compte</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className={cn(
              "text-3xl font-bold",
              tenant.balance < 0 ? "text-red-600" : "text-green-600"
            )}>
              {formatCurrency(tenant.balance)}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {tenant.balance < 0 ? "Le locataire doit de l'argent" : 
               tenant.balance > 0 ? "Le locataire a un surplus" : "Compte à jour"}
            </p>
            <Button className="w-full" onClick={() => setIsPaymentDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer un paiement
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell className="capitalize">{payment.type}</TableCell>
                  <TableCell>{payment.reference}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className={payment.status === 'paid' ? "bg-green-600" : "bg-yellow-500"}>
                      {payment.status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {tenantPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Aucun paiement enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        tenants={[tenant]}
        onSave={handleAddPayment}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
