'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building, CreditCard, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
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
      href: '/depenses',
      label: 'Dépenses',
      icon: Receipt,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-black text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">CAD Syndic</h1>
        <p className="text-sm text-slate-400 mt-1">Gestion de Syndic</p>
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
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>© 2026 Gestion Syndic</p>
      </div>
    </div>
  );
}
