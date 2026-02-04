import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { TenantDialog } from '@/components/tenants/TenantDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';

export function Tenants() {
  const { tenants, offices, addTenant, updateTenant, deleteTenant, updateOffice } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const navigate = useNavigate();

  const getOfficeNumber = (id: string) => offices.find(o => o.id === id)?.number || '-';
  
  const availableOffices = offices.filter(o => 
    o.status === 'available' || (currentTenant && o.id === currentTenant.officeId)
  );

  const handleAdd = () => {
    setCurrentTenant(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setIsDialogOpen(true);
  };

  const handleSave = (tenant: Tenant) => {
    if (currentTenant) {
      // If office changed, update previous office status
      if (currentTenant.officeId !== tenant.officeId) {
        updateOffice(currentTenant.officeId, { status: 'available', tenantId: undefined });
      }
      updateTenant(tenant.id, tenant);
    } else {
      addTenant(tenant);
    }
    // Update office status to occupied
    updateOffice(tenant.officeId, { status: 'occupied', tenantId: tenant.id });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      const tenant = tenants.find(t => t.id === id);
      if (tenant) {
        updateOffice(tenant.officeId, { status: 'available', tenantId: undefined });
      }
      deleteTenant(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Locataires</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un locataire
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Bureau</TableHead>
              <TableHead>Fin de contrat</TableHead>
              <TableHead>Solde</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow 
                key={tenant.id} 
                className="cursor-pointer" 
                onClick={() => navigate(`/tenants/${tenant.id}`)}
              >
                <TableCell className="font-bold">{tenant.companyName}</TableCell>
                <TableCell>{tenant.contactName}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{getOfficeNumber(tenant.officeId)}</TableCell>
                <TableCell>{formatDate(tenant.contractEnd)}</TableCell>
                <TableCell className={tenant.balance < 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                  {formatCurrency(tenant.balance)}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      tenant.status === 'active' ? "bg-green-600" :
                      tenant.status === 'ending-soon' ? "bg-orange-500" :
                      "bg-red-600"
                    }
                  >
                    {tenant.status === 'active' ? 'Actif' :
                     tenant.status === 'ending-soon' ? 'Bientôt fini' : 'Expiré'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/tenants/${tenant.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(tenant.id)}
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

      <TenantDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        tenant={currentTenant}
        availableOffices={availableOffices}
        onSave={handleSave}
      />
    </div>
  );
}
