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
      label: 'DÃ©penses',
      icon: Receipt,
    },
  ];

  return (
    <div className="w-50 min-h-screen bg-white text-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold">CAD Syndic</h1>
        <p className="text-sm text-slate-600 mt-1">Gestion de Syndic</p>
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
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-600">
        <p>Â© 2026 Gestion Syndic</p>
      </div>
    </div>
  );
}
