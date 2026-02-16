'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BUILDING_INFO } from '@/lib/constants'
import { Building2, Users, Settings as SettingsIcon } from 'lucide-react'

export default function ParametresPage() {
  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">Configuration du système</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="building" className="w-full">
        <TabsList className="grid w-full md:w-auto gap-2 md:gap-0">
          <TabsTrigger value="building" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Immeuble</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Building Settings */}
        <TabsContent value="building" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information de l&apos;Immeuble</CardTitle>
              <CardDescription>Détails de la copropriété</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la Copropriété</Label>
                  <Input
                    id="name"
                    defaultValue={BUILDING_INFO.name}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    defaultValue={BUILDING_INFO.address}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offices">Nombre de Bureaux</Label>
                  <Input
                    id="offices"
                    type="number"
                    defaultValue={BUILDING_INFO.totalOffices}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Année Fiscale</Label>
                  <Input
                    id="year"
                    type="number"
                    defaultValue={BUILDING_INFO.year}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <Button disabled>Mettre à Jour</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>
                Gérer les accès et les permissions des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La gestion des utilisateurs sera disponible dans une future version.
                </p>
                <p className="text-sm text-muted-foreground">
                  Les rôles suivants seront supportés:
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                  <li>Administrateur - Accès complet au système</li>
                  <li>Comptable - Gestion des finances et rapports</li>
                  <li>Gestionnaire - Suivi des paiements</li>
                  <li>Propriétaire - Consultation des états</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Système</CardTitle>
              <CardDescription>Paramètres généraux de l&apos;application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Langue</h3>
                  <p className="text-sm text-muted-foreground">Français</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Devise</h3>
                  <p className="text-sm text-muted-foreground">Dirham Marocain (MAD)</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sauvegarde Automatique</h3>
                  <p className="text-sm text-muted-foreground">
                    Les données sont sauvegardées automatiquement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Opérations système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" disabled>
                Exporter Toutes les Données
              </Button>
              <Button variant="outline" disabled>
                Nettoyer les Fichiers Temporaires
              </Button>
              <div className="text-sm text-muted-foreground pt-2">
                <p>Version: 1.0.0</p>
                <p className="mt-1">
                  Pour l&apos;assistance, contactez: support@syndicalaltas.ma
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
