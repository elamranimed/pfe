'use client';

import React from "react"
import { Sidebar } from './sidebar';
import { ModeToggle } from '@/components/mode-toggle';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-8 right-8 z-50">
          <ModeToggle />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
