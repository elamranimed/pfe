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
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { OfficeDialog } from '@/components/offices/OfficeDialog';
import type { Office } from '@/types';

export function Offices() {
  const { offices, tenants, addOffice, updateOffice, deleteOffice } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);

  const filteredOffices = offices.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getTenantName = (office: Office) => {
    return office.tenantName || '-';
  };

  const getTenantContact = (office: Office) => {
    return {
      phone: office.tenantPhone || '-',
      email: office.tenantEmail || '-',
    };
  };

  const handleAdd = () => {
    setCurrentOffice(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (office: Office) => {
    setCurrentOffice(office);
    setIsDialogOpen(true);
  };

  const handleSave = (office: Office) => {
    if (currentOffice) {
      updateOffice(office.id, office);
    } else {
      addOffice(office);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bureau ?')) {
      deleteOffice(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bureaux</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un bureau
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-64">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les bureaux</SelectItem>
              <SelectItem value="available">Vide/Disponible</SelectItem>
              <SelectItem value="occupied">Occupé</SelectItem>
              <SelectItem value="renovation">Aménagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Étage</TableHead>
              <TableHead>Locataire</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffices.map((office) => {
              const { phone, email } = getTenantContact(office);
              return (
                <TableRow key={office.id}>
                  <TableCell className="font-bold">{office.number}</TableCell>
                  <TableCell>{office.floor}</TableCell>
                  <TableCell>{getTenantName(office)}</TableCell>
                  <TableCell>{phone}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={office.status === 'available' ? 'default' : office.status === 'occupied' ? 'secondary' : 'outline'}
                      className={
                        office.status === 'available' ? 'bg-green-600 hover:bg-green-700' :
                        office.status === 'occupied' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }
                    >
                      {office.status === 'available' ? 'Vide/Disponible' :
                       office.status === 'occupied' ? 'Occupé' : 'Aménagement'}
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
                        <DropdownMenuItem onClick={() => handleEdit(office)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(office.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OfficeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        office={currentOffice}
        onSave={handleSave}
      />
    </div>
  );
}
