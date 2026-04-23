import { useState } from 'react'
import { Button, Input, Icon } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

interface Props {
  onLogin: (data: LoginRequest) => Promise<void>
  onRegister: (data: RegisterRequest) => Promise<void>
  loading: boolean
  error: string | null
}

const businessTypes = [
  { value: 'tienda', label: 'Tienda', emoji: '🛍️' },
  { value: 'barberia', label: 'Barbería', emoji: '💈' },
  { value: 'salon', label: 'Salón', emoji: '💇' },
  { value: 'papeleria', label: 'Papelería', emoji: '📝' },
  { value: 'otro', label: 'Otro', emoji: '🏪' }
]

export default function LoginPage({ onLogin, onRegister, loading, error }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('tienda')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await onLogin({ email, password })
      } else {
        await onRegister({ email, password, fullName, businessName, businessType })
      }
    } catch {
      // error ya manejado en useAuth
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Panel izquierdo: marca / pitch ─────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <span className="text-xl font-bold">K</span>
          </div>
          <span className="text-xl font-bold tracking-tight">KoreVentas</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Tu negocio,<br />en orden y creciendo.
          </h2>
          <p className="max-w-md text-brand-100/90 text-lg leading-relaxed">
            Ventas, inventario, clientes y métricas accionables — todo en un solo
            lugar, pensado para tiendas y servicios en Colombia.
          </p>

          <ul className="space-y-3 text-brand-50/90">
            {[
              'Pulso del negocio con acciones sugeridas',
              'POS rápido en cualquier dispositivo',
              'Auto-etiquetado de clientes: VIP, Frecuente, Inactivo',
              'Alertas de stock bajo y cumpleaños de clientes'
            ].map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon.Check className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/60">
          © {new Date().getFullYear()} KoreVentas · Hecho en Colombia 🇨🇴
        </p>
      </div>

      {/* ── Panel derecho: formulario ──────────────────────── */}
      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <span className="font-bold">K</span>
            </div>
            <span className="text-lg font-bold text-slate-800">KoreVentas</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu negocio'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'login'
                ? 'Ingresa para administrar tu día a día.'
                : 'En menos de un minuto tienes todo listo.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md py-2 text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-white text-slate-800 shadow-soft'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <Input
                  label="Nombre del negocio"
                  leftIcon={<Icon.Building className="h-4 w-4" />}
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  required
                  placeholder="Ej: Barbería Don Andrés"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tipo de negocio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {businessTypes.map(bt => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setBusinessType(bt.value)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-all',
                          businessType === bt.value
                            ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        )}
                      >
                        <span className="text-lg leading-none">{bt.emoji}</span>
                        <span className="font-medium">{bt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Tu nombre"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Andrés López"
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              hint={mode === 'register' ? 'Usa al menos 8 caracteres.' : undefined}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
                <Icon.AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" fullWidth loading={loading}>
              {mode === 'login' ? 'Entrar' : 'Crear mi negocio'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
