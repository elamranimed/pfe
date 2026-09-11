'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building, CreditCard, Receipt, ShieldAlert, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
    },
    {
      href: '/suivi-paiements',
      label: 'Suivi Paiements',
      icon: Grid,
    },
    {
      href: '/bureaux',
      label: 'Bureaux',
      icon: Building,
    },
    {
      href: '/paiements',
      label: 'Paiements',
      icon: CreditCard,
    },
    {
      href: '/recouvrement',
      label: 'Recouvrement',
      icon: ShieldAlert,
    },
    {
      href: '/depenses',
      label: 'Dépenses',
      icon: Receipt,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-card text-card-foreground border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">CAD Syndic</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestion de Syndic</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <p>© 2026 Gestion Syndic</p>
        <ModeToggle />
      </div>
    </div>
  );
}
