'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  DollarSign,
  AlertCircle,
  Zap,
  Book,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Revenus', href: '/revenus', icon: DollarSign },
  { label: 'Impayés', href: '/impayes', icon: AlertCircle },
  { label: 'Charges', href: '/charges', icon: Zap },
  { label: 'État Journalier', href: '/journal', icon: Book },
  { label: 'Bilan', href: '/bilan', icon: BarChart3 },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

export function NavigationSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-background px-4 py-4 sm:hidden">
        <div className="text-lg font-bold">Syndic Al Atlas</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden w-64 overflow-y-auto border-r bg-background p-6 sm:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Syndic Al Atlas</h1>
          <p className="text-xs text-muted-foreground">Fès, Maroc</p>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile navigation drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/20 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav className="fixed left-0 right-0 top-16 z-30 space-y-2 border-b bg-background p-6 sm:hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </>
      )}
    </>
  )
}
