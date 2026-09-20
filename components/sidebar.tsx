'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Building, CreditCard, Receipt, ShieldAlert, MessageSquareWarning, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserRole } from '@/lib/auth';

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<'admin' | 'responsable' | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const navItems = [
    {
      href: '/',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
    },
    {
      href: '/suivi-paiements',
      label: 'Paiements',
      icon: CreditCard,
    },
    {
      href: '/bureaux',
      label: 'Bureaux',
      icon: Building,
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
    {
      href: '/demandes',
      label: 'Demandes',
      icon: MessageSquareWarning,
    },
    {
      href: '/responsables',
      label: 'Responsables',
      icon: Users,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur de déconnexion', err);
    }
  };

  return (
    <div className="w-64 min-h-screen bg-card text-card-foreground border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">ENSA Syndic</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestion de Syndic</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (item.href === '/responsables' && role !== 'admin') return null;

          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-gradient-to-r from-[#0d2847] to-[#1a5298] hover:from-[#0a1e3d] hover:to-[#154985] text-white font-medium shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30'
                  : 'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform', isActive && 'text-white')} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </nav>
    </div>
  );
}
