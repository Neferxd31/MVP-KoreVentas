import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon } from './ui/icons'

interface NavItem {
  path: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { path: '/', label: 'Inicio', icon: <Icon.Home className="h-5 w-5" /> },
  { path: '/pos', label: 'Vender', icon: <Icon.Cart className="h-5 w-5" /> },
  { path: '/sales', label: 'Ventas', icon: <Icon.Receipt className="h-5 w-5" /> },
  { path: '/agenda', label: 'Agenda', icon: <Icon.Calendar className="h-5 w-5" /> },
  { path: '/products', label: 'Productos', icon: <Icon.Package className="h-5 w-5" /> },
  { path: '/services', label: 'Servicios', icon: <Icon.Scissors className="h-5 w-5" /> },
  { path: '/customers', label: 'Clientes', icon: <Icon.Users className="h-5 w-5" /> },
  { path: '/employees', label: 'Equipo', icon: <Icon.UserCheck className="h-5 w-5" /> },
  { path: '/cash', label: 'Caja', icon: <Icon.DollarSign className="h-5 w-5" /> },
  { path: '/expenses', label: 'Gastos', icon: <Icon.TrendingDown className="h-5 w-5" /> },
  { path: '/reports', label: 'Reportes', icon: <Icon.BarChart className="h-5 w-5" /> }
]

interface Props {
  children: ReactNode
  onLogout: () => void
}

export function AppLayout({ children, onLogout }: Props) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-200 bg-white">
        <SidebarContent currentPath={location.pathname} onLogout={onLogout} />
      </aside>

      {/* ── Topbar mobile ──────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-600">
          <LogoMark />
          <span>KoreVentas</span>
        </Link>
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <Icon.X className="h-5 w-5" /> : <Icon.Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ── Sidebar mobile (overlay) ───────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={closeMobile}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r border-slate-200 bg-white animate-slide-in-right">
            <SidebarContent
              currentPath={location.pathname}
              onLogout={() => { closeMobile(); onLogout() }}
              onNavigate={closeMobile}
            />
          </aside>
        </>
      )}

      {/* ── Contenido principal ────────────────────────────── */}
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}

function LogoMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
      <span className="text-sm font-bold">K</span>
    </span>
  )
}

function SidebarContent({
  currentPath,
  onLogout,
  onNavigate
}: {
  currentPath: string
  onLogout: () => void
  onNavigate?: () => void
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100">
        <LogoMark />
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">KoreVentas</p>
          <p className="text-[11px] text-slate-400 leading-tight">Gestión inteligente</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menú
        </p>
        <ul className="space-y-1">
          {navItems.map(item => {
            const active = currentPath === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors',
                      active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer: logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition"
        >
          <Icon.LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  )
}
