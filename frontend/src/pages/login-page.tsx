import { useState } from 'react'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

interface Props {
  onLogin: (data: LoginRequest) => Promise<void>
  onRegister: (data: RegisterRequest) => Promise<void>
  loading: boolean
  error: string | null
}

const businessTypes = [
  { value: 'tienda', label: '🛍️ Tienda' },
  { value: 'barberia', label: '💈 Barbería' },
  { value: 'salon', label: '💇 Salón de belleza' },
  { value: 'papeleria', label: '📝 Papelería' },
  { value: 'otro', label: '🏪 Otro' }
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

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">KoreVentas</h1>
          <p className="text-slate-500 mt-1">Gestión de ventas y clientes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-slate-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del negocio</label>
                  <input className={inputClass} value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="Ej: Barbería Don Andrés" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de negocio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {businessTypes.map(bt => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setBusinessType(bt.value)}
                        className={`rounded-lg border px-3 py-2 text-sm text-left transition ${
                          businessType === bt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre</label>
                  <input className={inputClass} value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Ej: Andrés López" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres" />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear mi negocio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
