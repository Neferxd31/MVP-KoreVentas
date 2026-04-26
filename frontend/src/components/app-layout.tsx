import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon } from './ui/icons'

interface NavItem {
  path: string
  label: string
  icon: ReactNode
}

// Items principales — siempre visibles en desktop sidebar y en mobile bottom-nav
const primaryNav: NavItem[] = [
  { path: '/', label: 'Inicio', icon: <Icon.Home className="h-5 w-5" /> },
  { path: '/pos', label: 'Vender', icon: <Icon.Cart className="h-5 w-5" /> },
  { path: '/agenda', label: 'Agenda', icon: <Icon.Calendar className="h-5 w-5" /> },
  { path: '/products', label: 'Productos', icon: <Icon.Package className="h-5 w-5" /> }
]

// Resto — solo en sidebar desktop y en sheet "Más" de mobile
const secondaryNav: NavItem[] = [
  { path: '/sales', label: 'Ventas', icon: <Icon.Receipt className="h-5 w-5" /> },
  { path: '/services', label: 'Servicios', icon: <Icon.Scissors className="h-5 w-5" /> },
  { path: '/customers', label: 'Clientes', icon: <Icon.Users className="h-5 w-5" /> },
  { path: '/employees', label: 'Equipo', icon: <Icon.UserCheck className="h-5 w-5" /> },
  { path: '/cash', label: 'Caja', icon: <Icon.DollarSign className="h-5 w-5" /> },
  { path: '/expenses', label: 'Gastos', icon: <Icon.TrendingDown className="h-5 w-5" /> },
  { path: '/reports', label: 'Reportes', icon: <Icon.BarChart className="h-5 w-5" /> },
  { path: '/goals', label: 'Metas', icon: <Icon.Star className="h-5 w-5" /> }
]

const allNav = [...primaryNav, ...secondaryNav]

interface Props {
  children: ReactNode
  onLogout: () => void
}

export function AppLayout({ children, onLogout }: Props) {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const closeSheet = () => setSheetOpen(false)

  // Para imprimir recibos: ocultar todo el chrome
  const isReceiptRoute = /^\/sales\/[^/]+\/receipt$/.test(location.pathname)
  if (isReceiptRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <aside className="no-print hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-200 bg-white">
        <SidebarContent currentPath={location.pathname} onLogout={onLogout} />
      </aside>

      {/* ── Topbar mobile (solo branding + logout, no menú) ──── */}
      <header className="no-print lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-600">
          <LogoMark />
          <span>KoreVentas</span>
        </Link>
        <button
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition"
          aria-label="Cerrar sesión"
        >
          <Icon.LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* ── Contenido principal ──────────────────────────────── */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* ── Bottom-nav mobile ────────────────────────────────── */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {primaryNav.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
                  active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <span className={cn('transition-colors', active && 'scale-110')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
              sheetOpen || secondaryNav.some(i => i.path === location.pathname)
                ? 'text-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon.Menu className="h-5 w-5" />
            <span>Más</span>
          </button>
        </div>
      </nav>

      {/* ── Sheet mobile "Más" ───────────────────────────────── */}
      {sheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={closeSheet}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-soft animate-slide-in-up max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
              <h3 className="text-base font-semibold text-slate-800">Más opciones</h3>
              <button
                onClick={closeSheet}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon.X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {secondaryNav.map(item => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSheet}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <span className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        active ? 'bg-white text-brand-600' : 'bg-white text-slate-500'
                      )}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
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
  onLogout
}: {
  currentPath: string
  onLogout: () => void
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
          {allNav.map(item => {
            const active = currentPath === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
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
