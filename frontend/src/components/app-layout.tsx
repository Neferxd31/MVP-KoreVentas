import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon } from './ui/icons'
import { useSettings } from '@/hooks/use-settings'
import { useMe } from '@/hooks/use-account'
import { useTheme } from '@/context/ThemeContext'

interface NavItem {
  path: string
  label: string
  icon: ReactNode
  adminOnly?: boolean
}

const primaryNav: NavItem[] = [
  { path: '/', label: 'Inicio', icon: <Icon.Home className="h-5 w-5" /> },
  { path: '/pos', label: 'Vender', icon: <Icon.Cart className="h-5 w-5" /> },
  { path: '/agenda', label: 'Agenda', icon: <Icon.Calendar className="h-5 w-5" /> },
  { path: '/products', label: 'Productos', icon: <Icon.Package className="h-5 w-5" /> }
]

const secondaryNav: NavItem[] = [
  { path: '/sales', label: 'Ventas', icon: <Icon.Receipt className="h-5 w-5" /> },
  { path: '/services', label: 'Servicios', icon: <Icon.Scissors className="h-5 w-5" /> },
  { path: '/customers', label: 'Clientes', icon: <Icon.Users className="h-5 w-5" /> },
  { path: '/employees', label: 'Empleados', icon: <Icon.UserCheck className="h-5 w-5" />, adminOnly: true },
  { path: '/cash', label: 'Caja', icon: <Icon.DollarSign className="h-5 w-5" />, adminOnly: true },
  { path: '/expenses', label: 'Gastos', icon: <Icon.TrendingDown className="h-5 w-5" />, adminOnly: true },
  { path: '/reports', label: 'Reportes', icon: <Icon.BarChart className="h-5 w-5" />, adminOnly: true },
  { path: '/goals', label: 'Metas', icon: <Icon.Star className="h-5 w-5" />, adminOnly: true },
  { path: '/team', label: 'Usuarios del sistema', icon: <Icon.UserCheck className="h-5 w-5" />, adminOnly: true },
  { path: '/settings', label: 'Personalización', icon: <Icon.Sparkles className="h-5 w-5" />, adminOnly: true }
]

const allNav = [...primaryNav, ...secondaryNav]

interface Props {
  children: ReactNode
  onLogout: () => void
}

export function AppLayout({ children, onLogout }: Props) {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: settings } = useSettings()
  const { data: me } = useMe()
  const { theme, toggleTheme } = useTheme()

  const businessName = settings?.businessName || 'KoreVentas'
  const logoUrl = settings?.logoUrl ?? null
  const isAdmin = me?.role === 'ADMIN'

  // Para saber qué ícono mostrar, verificamos si es de noche realmente
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const closeSheet = () => setSheetOpen(false)

  const isReceiptRoute = /^\/sales\/[^/]+\/receipt$/.test(location.pathname)
  if (isReceiptRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      
      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <aside className="no-print hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <SidebarContent
          currentPath={location.pathname}
          onLogout={onLogout}
          businessName={businessName}
          logoUrl={logoUrl}
          me={me}
          isAdmin={isAdmin}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </aside>

      {/* ── Topbar mobile ───────────────────────────────────── */}
      <header className="no-print lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-600 min-w-0">
          <LogoMark logoUrl={logoUrl} />
          <span className="truncate dark:text-brand-400">{businessName}</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Icon.Sun className="h-5 w-5" /> : <Icon.Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Cerrar sesión"
          >
            <Icon.LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Contenido principal ──────────────────────────────── */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* ── Bottom-nav mobile ────────────────────────────────── */}
      <nav className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
        <div className="grid grid-cols-5">
          {primaryNav.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
                  active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                )}
              >
                <span className={cn('transition-transform duration-200', active && 'scale-110')}>
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
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
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
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-soft animate-slide-in-up max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Más opciones</h3>
              <button
                onClick={closeSheet}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <Icon.X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {secondaryNav.filter(i => !i.adminOnly || isAdmin).map(item => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSheet}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all',
                        active
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <span className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        active ? 'bg-white text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
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

function LogoMark({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-soft">
        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
      </span>
    )
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
      <span className="text-sm font-bold">K</span>
    </span>
  )
}

function SidebarContent({
  currentPath,
  onLogout,
  businessName,
  logoUrl,
  me,
  isAdmin,
  isDarkMode,
  toggleTheme
}: {
  currentPath: string
  onLogout: () => void
  businessName: string
  logoUrl: string | null
  me: { fullName: string; email: string; avatarUrl: string | null; role: string } | undefined
  isAdmin: boolean
  isDarkMode: boolean
  toggleTheme: () => void
}) {
  const isCustomized = businessName !== 'KoreVentas'
  return (
    <>
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800">
        <LogoMark logoUrl={logoUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 leading-tight truncate dark:text-white">
            {businessName}
          </p>
          <p className="text-[11px] text-slate-400 leading-tight">
            {isCustomized ? 'Hecho con KoreVentas' : 'Gestión inteligente'}
          </p>
        </div>
        
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition dark:hover:bg-slate-800"
          aria-label="Alternar tema"
        >
          {isDarkMode ? <Icon.Sun className="h-4 w-4" /> : <Icon.Moon className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menú
        </p>
        <ul className="space-y-1">
          {allNav.filter(i => !i.adminOnly || isAdmin).map(item => {
            const active = currentPath === item.path || currentPath.startsWith(item.path + '/')
            // Prevención para que '/pos' no active '/' accidentalmente
            const isExactlyHome = item.path === '/'
            const isActive = isExactlyHome ? currentPath === '/' : active

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <UserFooter me={me} onLogout={onLogout} />
    </>
  )
}

function UserFooter({
  me,
  onLogout
}: {
  me: { fullName: string; email: string; avatarUrl: string | null; role: string } | undefined
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-slate-100 p-3 relative dark:border-slate-800">
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-[68px] left-3 right-3 z-20 rounded-xl border border-slate-200 bg-white shadow-soft-lg animate-fade-in p-1.5 dark:border-slate-700 dark:bg-slate-800">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Icon.UserCheck className="h-4 w-4 text-slate-400 dark:text-slate-400" />
              Mi cuenta
            </Link>
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
            >
              <Icon.LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        {me?.avatarUrl ? (
          <img
            src={me.avatarUrl}
            alt={me.fullName}
            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
            {(me?.fullName ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
            {me?.fullName ?? 'Cargando...'}
          </p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {me?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <Icon.ChevronRight className={cn(
          'h-4 w-4 flex-shrink-0 text-slate-400 transition-transform',
          open && 'rotate-90'
        )} />
      </button>
    </div>
  )
}