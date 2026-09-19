'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Inline SVG icons matching the sidebar's lucide icons (avoids vendor-chunk bundling issues)
const featureIcons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  creditCard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  building: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  shieldAlert: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
  ),
  receipt: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
  ),
  messageWarning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v2"/><path d="M12 13h.01"/></svg>
  ),
}

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      router.push('/')
    } catch (err) {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  const features = [
    { icon: featureIcons.dashboard, text: 'Tableau de Bord' },
    { icon: featureIcons.creditCard, text: 'Paiements' },
    { icon: featureIcons.building, text: 'Bureaux' },
    { icon: featureIcons.shieldAlert, text: 'Recouvrement' },
    { icon: featureIcons.receipt, text: 'Dépenses' },
    { icon: featureIcons.messageWarning, text: 'Demandes' },
  ]

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#1a4b8c]" />

        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="login-float-1 absolute top-[10%] left-[10%] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="login-float-2 absolute top-[50%] right-[5%] w-96 h-96 rounded-full bg-cyan-400/8 blur-3xl" />
          <div className="login-float-3 absolute bottom-[10%] left-[30%] w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo area */}
          <div className="login-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logoSyndic.png"
                  alt="ENSA Syndic"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg tracking-tight">ENSA Syndic</h2>
                <p className="text-blue-200/60 text-xs tracking-wide uppercase">Application web de gestion de syndic</p>
              </div>
            </div>
          </div>

          {/* Center messaging */}
          <div className="login-fade-in-delay-1 flex-1 flex flex-col justify-center max-w-lg">
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
                Gérez vos biens
                <span className="block mt-1 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  en toute simplicité
                </span>
              </h1>

              <p className="text-blue-100/50 text-base leading-relaxed max-w-md">
                Plateforme centralisée pour la gestion de syndic, le suivi des paiements et la coordination des dépenses.
              </p>
            </div>

            {/* Feature pills */}
            <div className="login-fade-in-delay-2 flex flex-wrap gap-3 mt-10">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm text-sm text-blue-100/70 transition-colors hover:bg-white/[0.08] hover:border-white/[0.12]"
                >
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <div className="login-fade-in-delay-3">
            <p className="text-blue-200/30 text-xs">
              © {new Date().getFullYear()} ENSA Syndic — Tous droits réservés
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[420px] login-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d2847] to-[#1a4b8c] flex items-center justify-center overflow-hidden shadow-lg shadow-blue-900/20">
              <Image
                src="/logoSyndic.png"
                alt="ENSA Syndic"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-foreground font-bold text-xl tracking-tight">ENSA Syndic</h2>
              <p className="text-muted-foreground text-xs tracking-wide">Application web de gestion de syndic</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-black/[0.04] bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6 px-7 pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Bienvenue
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 text-sm leading-relaxed">
                Connectez-vous à votre espace de gestion
              </CardDescription>
            </CardHeader>
            <CardContent className="px-7 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Login field */}
                <div className="space-y-2.5">
                  <Label htmlFor="login" className="text-sm font-medium text-foreground/80">
                    Identifiant
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <Input
                      id="login"
                      name="login"
                      type="text"
                      required
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="Votre identifiant"
                      disabled={loading}
                      className="h-11 pl-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      disabled={loading}
                      className="h-11 pl-10 pr-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-11 mt-2 bg-gradient-to-r from-[#0d2847] to-[#1a5298] hover:from-[#0a1e3d] hover:to-[#154985] text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/30 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              {/* Divider & footer */}
              <div className="mt-8 pt-6 border-t border-border/40">
                <p className="text-center text-xs text-muted-foreground/60">
                  Accès réservé aux administrateurs et responsables autorisés
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom mobile copyright */}
          <p className="lg:hidden text-center text-xs text-muted-foreground/40 mt-8">
            © {new Date().getFullYear()} ENSA Syndic — Tous droits réservés
          </p>
        </div>
      </div>

      {/* ── Login page animations ── */}
      <style jsx>{`
        @keyframes loginFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes loginFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes loginFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 20px) scale(1.15); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-float-1 { animation: loginFloat1 8s ease-in-out infinite; }
        .login-float-2 { animation: loginFloat2 10s ease-in-out infinite; }
        .login-float-3 { animation: loginFloat3 12s ease-in-out infinite; }

        .login-fade-in {
          animation: loginFadeIn 0.6s ease-out both;
        }
        .login-fade-in-delay-1 {
          animation: loginFadeIn 0.6s ease-out 0.15s both;
        }
        .login-fade-in-delay-2 {
          animation: loginFadeIn 0.6s ease-out 0.3s both;
        }
        .login-fade-in-delay-3 {
          animation: loginFadeIn 0.6s ease-out 0.45s both;
        }
      `}</style>
    </div>
  )
}
