import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import '../globals.css'
import { NavigationSidebar } from '@/app/components/navigation-sidebar'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CAD Immobilier',
  description: 'Système de gestion des charges de copropriété',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <NavigationSidebar />
        <main className="sm:ml-64">
          {children}
        </main>
      </body>
    </html>
  )
}
