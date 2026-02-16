'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { OfficesTable } from '@/components/offices-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { mockOffices } from '@/lib/mock-data';
import { Office } from '@/lib/types';

type FilterStatus = 'all' | 'available' | 'occupied' | 'maintenance';

export default function BureauxPage() {
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredOffices =
    filter === 'all'
      ? offices
      : offices.filter((o) => o.status === filter);

  const handleAddOffice = (newOffice: Office) => {
    setOffices([...offices, newOffice]);
  };

  const handleUpdateOffice = (updatedOffice: Office) => {
    setOffices(
      offices.map((o) => (o.id === updatedOffice.id ? updatedOffice : o))
    );
  };

  const handleDeleteOffice = (officeId: string) => {
    setOffices(offices.filter((o) => o.id !== officeId));
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Bureaux & Locataires
          </h1>
          <p className="text-slate-600">
            Gestion unifiée des bureaux et informations locataires
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Filtrer:</span>
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupé</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <OfficesTable
            offices={filteredOffices}
            onAddOffice={handleAddOffice}
            onUpdateOffice={handleUpdateOffice}
            onDeleteOffice={handleDeleteOffice}
          />
        </Card>
      </div>
    </MainLayout>
  );
}