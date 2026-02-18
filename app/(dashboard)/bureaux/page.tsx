import BureauService from '@/services/BureauService';
import { BureauTable } from '@/app/components/bureau-table';
import { MainLayout } from '@/app/components/main-layout';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';

export default async function BureauxPage() {
  const bureaux = await BureauService.findAll();

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestion des Bureaux</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter Bureau
        </Button>
      </div>
      <BureauTable bureaux={bureaux} />
    </MainLayout>
  );
}
