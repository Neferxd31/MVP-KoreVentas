import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  SkeletonCard
} from '@/components/ui'
import { cn, formatCop } from '@/lib/utils'
import { waLink, waTemplates } from '@/lib/whatsapp'
import { useState } from 'react'
import { useInsights } from '@/hooks/use-insights'
import { useCurrentGoal } from '@/hooks/use-goal'
import { useOnboarding, type OnboardingStatus } from '@/hooks/use-onboarding'
import { useSettings } from '@/hooks/use-settings'
import type { Insights } from '@/types/insights'
import type { GoalProgress } from '@/types/goal'

type ClienteEnfriandose = {
  id: string
  fullName: string
  phone: string | null
  diasSinVisita: number
}

type ProductoStockBajo = {
  id: string
  name: string
  stock: number
  stockAlert: number
}

type Cumpleanos = {
  id: string
  fullName: string
  phone: string | null
  birthday: string
}

type Pulso = {
  ventasHoy: number
  ventasAyer: number
  variacionVentasPct: number
  ticketPromedioSemana: number
  ticketPromedioSemanaAnterior: number
  variacionTicketPct: number
  ordenesHoy: number
  clientesEnfriandose: ClienteEnfriandose[]
  totalClientesInactivos: number
  productosStockBajo: ProductoStockBajo[]
  totalProductosStockBajo: number
  cumpleanosSemana: Cumpleanos[]
}

function Variacion({ pct }: { pct: number }) {
  const n = Number(pct)
  if (n === 0) {
    return <span className="text-xs font-medium text-slate-500 dark:text-slate-400">= 0%</span>
  }
  const up = n > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold transition-colors',
        up 
          ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400' 
          : 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
      )}
    >
      {up ? <Icon.TrendingUp className="h-3 w-3" /> : <Icon.TrendingDown className="h-3 w-3" />}
      {Math.abs(n).toFixed(1)}%
    </span>
  )
}

function MetricCard({
  label,
  value,
  icon,
  trend,
  subtitle
}: {
  label: string
  value: string
  icon: React.ReactNode
  trend?: React.ReactNode
  subtitle?: React.ReactNode
}) {
  return (
    <Card className="relative overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 transition-colors">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
        {subtitle}
        {trend}
      </div>
    </Card>
  )
}

export default function HomePage() {
  const { data: pulso, isLoading, isError } = useQuery<Pulso>({
    queryKey: ['dashboard-pulso'],
    queryFn: async () => (await api.get<Pulso>('/dashboard/pulso')).data
  })
  const { data: insights } = useInsights()
  const { data: goal } = useCurrentGoal()
  const { data: onboarding } = useOnboarding()
  const { data: settings } = useSettings()
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem('koreventas.onboarding.dismissed') === '1'
  )
  const dismissOnboarding = () => {
    localStorage.setItem('koreventas.onboarding.dismissed', '1')
    setOnboardingDismissed(true)
  }
  const showOnboarding = onboarding && !onboarding.isComplete && !onboardingDismissed

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl transition-colors">
            {settings?.businessName ? `Pulso de ${settings.businessName}` : 'Pulso del negocio'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            Lo que necesitas saber hoy para tomar acción.
          </p>
        </div>
        <Link to="/pos" className="hidden sm:block">
          <Button leftIcon={<Icon.Cart className="h-4 w-4" />}>Nueva venta</Button>
        </Link>
      </div>

      {/* Onboarding checklist */}
      {showOnboarding && onboarding && (
        <div className="mb-7">
          <OnboardingChecklist status={onboarding} onDismiss={dismissOnboarding} />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {isError && (
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="No se pudo cargar el pulso"
          description="Revisa la conexión con el backend e intenta recargar."
        />
      )}

      {pulso && (
        <>
          {/* Métricas clave */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              label="Ventas hoy"
              value={formatCop(pulso.ventasHoy)}
              icon={<Icon.Receipt className="h-5 w-5" />}
              subtitle={<span>vs {formatCop(pulso.ventasAyer)} ayer</span>}
              trend={<Variacion pct={pulso.variacionVentasPct} />}
            />
            <MetricCard
              label="Ticket promedio semana"
              value={formatCop(pulso.ticketPromedioSemana)}
              icon={<Icon.TrendingUp className="h-5 w-5" />}
              subtitle={<span>vs semana pasada</span>}
              trend={<Variacion pct={pulso.variacionTicketPct} />}
            />
            <MetricCard
              label="Órdenes hoy"
              value={String(pulso.ordenesHoy)}
              icon={<Icon.Cart className="h-5 w-5" />}
              subtitle={<span className="text-slate-500 dark:text-slate-400">ventas completadas</span>}
            />
          </div>

          {/* Meta del mes */}
          {goal && (
            <div className="mt-8">
              <GoalCard goal={goal} />
            </div>
          )}

          {/* Qué vender hoy — insights accionables */}
          {insights && (insights.champion || insights.slowMover || insights.bundle) && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Qué vender hoy
              </h2>
              <InsightsRow insights={insights} />
            </div>
          )}

          {/* Atajos rápidos a gestión financiera */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gestión del día
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ShortcutCard
                to="/cash"
                title="Caja diaria"
                subtitle="Abrir / cerrar arqueo"
                icon={<Icon.DollarSign className="h-5 w-5" />}
                tone="brand"
              />
              <ShortcutCard
                to="/expenses"
                title="Gastos"
                subtitle="Registrar costos"
                icon={<Icon.Receipt className="h-5 w-5" />}
                tone="warning"
              />
              <ShortcutCard
                to="/reports"
                title="Reportes"
                subtitle="Análisis del negocio"
                icon={<Icon.BarChart className="h-5 w-5" />}
                tone="success"
              />
              <ShortcutCard
                to="/goals"
                title="Metas del mes"
                subtitle="Avance vs objetivo"
                icon={<Icon.Star className="h-5 w-5" />}
                tone="brand"
              />
            </div>
          </div>

          {/* Tarjetas accionables */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Acciones sugeridas
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Clientes enfriándose */}
              <ActionCard
                tone="warning"
                icon={<Icon.Users className="h-5 w-5" />}
                title="Clientes enfriándose"
                count={pulso.totalClientesInactivos}
                subtitle="sin visitar hace más de 60 días"
                items={pulso.clientesEnfriandose.map(c => ({
                  key: c.id,
                  left: c.fullName,
                  right: `${c.diasSinVisita}d`,
                  waHref: waLink(c.phone, waTemplates.reactivation(c.fullName))
                }))}
                emptyLabel="Sin clientes inactivos."
                actionLabel={pulso.totalClientesInactivos > 0 ? 'Contactarlos ahora' : undefined}
                actionHref="/customers"
              />

              {/* Stock bajo */}
              <ActionCard
                tone="danger"
                icon={<Icon.Package className="h-5 w-5" />}
                title="Stock bajo"
                count={pulso.totalProductosStockBajo}
                subtitle="productos por debajo del umbral"
                items={pulso.productosStockBajo.map(p => ({
                  key: p.id,
                  left: p.name,
                  right: `${p.stock} / ${p.stockAlert}`,
                  rightDanger: true
                }))}
                emptyLabel="Todo el stock está sano."
                actionLabel={pulso.totalProductosStockBajo > 0 ? 'Ver productos' : undefined}
                actionHref="/products"
              />

              {/* Cumpleaños */}
              <ActionCard
                tone="pink"
                icon={<Icon.Cake className="h-5 w-5" />}
                title="Cumpleaños esta semana"
                count={pulso.cumpleanosSemana.length}
                subtitle="clientes para felicitar"
                items={pulso.cumpleanosSemana.map(c => ({
                  key: c.id,
                  left: c.fullName,
                  right: c.birthday.substring(5),
                  waHref: waLink(c.phone, waTemplates.birthday(c.fullName))
                }))}
                emptyLabel="Sin cumpleaños esta semana."
                actionLabel={pulso.cumpleanosSemana.length > 0 ? 'Ver todos' : undefined}
                actionHref="/customers"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── ShortcutCard: atajo compacto a otra página ───────────
function ShortcutCard({
  to,
  title,
  subtitle,
  icon,
  tone
}: {
  to: string
  title: string
  subtitle: string
  icon: React.ReactNode
  tone: 'brand' | 'warning' | 'success'
}) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:group-hover:bg-brand-900/50',
    warning: 'bg-warning-50 text-warning-700 group-hover:bg-warning-100 dark:bg-warning-900/30 dark:text-warning-400 dark:group-hover:bg-warning-900/50',
    success: 'bg-success-50 text-success-700 group-hover:bg-success-100 dark:bg-success-900/30 dark:text-success-400 dark:group-hover:bg-success-900/50'
  }
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-all hover:shadow-soft-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-colors', toneMap[tone])}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white transition-colors">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{subtitle}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── ActionCard: tarjeta accionable reutilizable ───────────
type ActionTone = 'warning' | 'danger' | 'pink' | 'brand'

interface ActionCardProps {
  tone: ActionTone
  icon: React.ReactNode
  title: string
  count: number
  subtitle: string
  items: { key: string; left: string; right: string; rightDanger?: boolean; waHref?: string | null }[]
  emptyLabel: string
  actionLabel?: string
  actionHref?: string
}

const toneStyles: Record<
  ActionTone,
  { icon: string; ring: string; button: string }
> = {
  warning: {
    icon: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    ring: 'ring-warning-100 dark:ring-warning-900/50',
    button: 'bg-warning-600 hover:bg-warning-700 dark:bg-warning-600/90 dark:hover:bg-warning-500'
  },
  danger: {
    icon: 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    ring: 'ring-danger-100 dark:ring-danger-900/50',
    button: 'bg-danger-600 hover:bg-danger-700 dark:bg-danger-600/90 dark:hover:bg-danger-500'
  },
  pink: {
    icon: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    ring: 'ring-pink-100 dark:ring-pink-900/50',
    button: 'bg-pink-600 hover:bg-pink-700 dark:bg-pink-600/90 dark:hover:bg-pink-500'
  },
  brand: {
    icon: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    ring: 'ring-brand-100 dark:ring-brand-900/50',
    button: 'bg-brand-600 hover:bg-brand-700 dark:bg-brand-600/90 dark:hover:bg-brand-500'
  }
}

function ActionCard({
  tone, icon, title, count, subtitle, items, emptyLabel, actionLabel, actionHref
}: ActionCardProps) {
  const s = toneStyles[tone]
  return (
    <Card className="flex flex-col dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <CardHeader
        icon={
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl ring-4 transition-colors',
              s.icon,
              s.ring
            )}
          >
            {icon}
          </div>
        }
        title={
          <div className="flex items-baseline gap-2">
            <span className="dark:text-slate-200">{title}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
          </div>
        }
        subtitle={<span className="dark:text-slate-400">{subtitle}</span>}
      />

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
          {items.map(it => (
            <li key={it.key} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="truncate flex-1 text-slate-700 dark:text-slate-300">{it.left}</span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  it.rightDanger ? 'text-danger-600 dark:text-danger-400' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {it.right}
              </span>
              {it.waHref && (
                <a
                  href={it.waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition dark:hover:bg-[#25D366]/20"
                  title="Enviar WhatsApp"
                  onClick={e => e.stopPropagation()}
                >
                  <Icon.WhatsApp className="h-4 w-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      )}

      {actionLabel && actionHref && (
        <Link to={actionHref} className="mt-auto pt-5">
          <button
            className={cn(
              'inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-soft transition active:scale-[0.98]',
              s.button
            )}
          >
            {actionLabel}
          </button>
        </Link>
      )}
    </Card>
  )
}

// ─── OnboardingChecklist: pasos para empezar ───────────────────
function OnboardingChecklist({
  status,
  onDismiss
}: {
  status: OnboardingStatus
  onDismiss: () => void
}) {
  const steps: { key: keyof OnboardingStatus; label: string; description: string; href: string }[] = [
    { key: 'hasCatalog', label: 'Crea tu primer producto o servicio', description: 'Lo necesitas para vender', href: '/products' },
    { key: 'hasCustomer', label: 'Registra tu primer cliente', description: 'O vincula uno por teléfono al vender', href: '/customers' },
    { key: 'hasFirstSale', label: 'Haz tu primera venta', description: 'Aquí empieza la magia', href: '/pos' },
    { key: 'hasCashSession', label: 'Abre tu caja por primera vez', description: 'Para arquear el efectivo del día', href: '/cash' },
    { key: 'hasGoal', label: 'Fija tu meta del mes', description: 'Mide tu progreso día a día', href: '/goals' },
    { key: 'hasCostsDefined', label: 'Define el costo de 3 productos', description: 'Para ver tu utilidad real', href: '/products' }
  ]
  const pct = (status.completedSteps / status.totalSteps) * 100

  return (
    <Card className="relative overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50/60 to-white dark:border-brand-900/50 dark:from-brand-900/20 dark:to-slate-900 transition-colors">
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        title="Ocultar"
      >
        <Icon.X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-4 ring-brand-50 dark:bg-brand-900/40 dark:text-brand-400 dark:ring-brand-900/20 transition-colors">
          <Icon.Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Para empezar
          </p>
          <p className="text-base font-bold text-slate-800 dark:text-white">
            {status.completedSteps} de {status.totalSteps} pasos completados
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map(step => {
          const done = !!status[step.key]
          return (
            <li key={step.key}>
              <Link
                to={step.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-2.5 transition-colors',
                  done ? 'opacity-60' : 'hover:bg-white dark:hover:bg-slate-800/50'
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  done
                    ? 'border-success-500 bg-success-500 text-white dark:border-success-600 dark:bg-success-600'
                    : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
                )}>
                  {done && <Icon.Check className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    done ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'
                  )}>
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                  )}
                </div>
                {!done && <Icon.ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

// ─── GoalCard: progreso del mes con proyección ────────────────
function GoalCard({ goal }: { goal: GoalProgress }) {
  if (!goal.goalSet) {
    return (
      <Card className="flex items-center justify-between gap-4 border-2 border-dashed border-brand-200 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-900/10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 transition-colors">
            <Icon.Star className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Define tu meta del mes</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mide tu avance día a día y proyecta el cierre del mes.
            </p>
          </div>
        </div>
        <Link to="/goals">
          <Button size="sm">Fijar meta</Button>
        </Link>
      </Card>
    )
  }

  const revenuePct = goal.revenueTarget > 0
    ? Math.min(100, (goal.revenueSoFar / goal.revenueTarget) * 100)
    : 0
  const expectedPct = (goal.dayOfMonth / goal.daysInMonth) * 100
  const isAhead = revenuePct >= expectedPct
  const projectionPct = goal.revenueTarget > 0
    ? (goal.projectedRevenue / goal.revenueTarget) * 100
    : 0

  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/50 transition-colors">
            <Icon.Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meta del mes
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCop(goal.revenueSoFar)}
              <span className="ml-2 text-sm font-medium text-slate-400 dark:text-slate-500">
                de {formatCop(goal.revenueTarget)}
              </span>
            </p>
          </div>
        </div>
        <Link to="/goals" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Ajustar
        </Link>
      </div>

      <div className="mt-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="absolute top-0 h-full w-px bg-slate-400/60 dark:bg-slate-500/60"
            style={{ left: `${expectedPct}%` }}
            title={`Día ${goal.dayOfMonth}/${goal.daysInMonth}`}
          />
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isAhead ? 'bg-success-500' : 'bg-warning-500'
            )}
            style={{ width: `${revenuePct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={cn(
            'font-semibold',
            isAhead ? 'text-success-700 dark:text-success-400' : 'text-warning-700 dark:text-warning-400'
          )}>
            {revenuePct.toFixed(0)}% completado
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Proyectado: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
              {formatCop(goal.projectedRevenue)}
            </span>{' '}
            ({projectionPct.toFixed(0)}%)
          </span>
        </div>
      </div>
    </Card>
  )
}

// ─── InsightsRow: 3 sugerencias accionables ────────────────────
function InsightsRow({ insights }: { insights: Insights }) {
  const cards: Array<{
    key: string
    tone: 'success' | 'warning' | 'brand'
    icon: React.ReactNode
    label: string
    title: string
    body: React.ReactNode
  }> = []

  if (insights.champion) {
    cards.push({
      key: 'champion',
      tone: 'success',
      icon: <Icon.TrendingUp className="h-5 w-5" />,
      label: 'Tu campeón de la semana',
      title: insights.champion.name,
      body: (
        <>
          <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
            {insights.champion.quantity}
          </span>{' '}
          unidades · {formatCop(insights.champion.revenue)} de ingresos. Empújalo otra vez.
        </>
      )
    })
  }

  if (insights.slowMover) {
    cards.push({
      key: 'slow',
      tone: 'warning',
      icon: <Icon.AlertTriangle className="h-5 w-5" />,
      label: 'Tiene stock pero no se mueve',
      title: insights.slowMover.name,
      body: (
        <>
          <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
            {insights.slowMover.stock} unidades
          </span>{' '}
          en bodega y 0 ventas en 14 días. Considera ofrecerlo con descuento.
        </>
      )
    })
  }

  if (insights.bundle) {
    cards.push({
      key: 'bundle',
      tone: 'brand',
      icon: <Icon.Sparkles className="h-5 w-5" />,
      label: 'Combinan bien juntos',
      title: `${insights.bundle.first} + ${insights.bundle.second}`,
      body: (
        <>
          Se han comprado juntos{' '}
          <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
            {insights.bundle.timesTogether} veces
          </span>
          . Cuando vendas uno, ofrece el otro.
        </>
      )
    })
  }

  if (cards.length === 0) {
    return (
      <Card padding="sm" className="dark:bg-slate-900 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Vuelve cuando tengas algunas ventas registradas — necesito datos para sugerirte qué empujar.
        </p>
      </Card>
    )
  }

  const toneMap: Record<string, string> = {
    success: 'bg-success-50 text-success-700 ring-success-100 dark:bg-success-900/30 dark:text-success-400 dark:ring-success-900/50',
    warning: 'bg-warning-50 text-warning-700 ring-warning-100 dark:bg-warning-900/30 dark:text-warning-400 dark:ring-warning-900/50',
    brand: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/50'
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map(c => (
        <Card key={c.key} className="flex flex-col gap-3 dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-4 transition-colors',
              toneMap[c.tone]
            )}>
              {c.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {c.label}
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">{c.title}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{c.body}</p>
        </Card>
      ))}
    </div>
  )
}