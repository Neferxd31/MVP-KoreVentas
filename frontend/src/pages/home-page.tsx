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
    return <span className="text-xs font-medium text-slate-500">= 0%</span>
  }
  const up = n > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
        up ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
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
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pulso del negocio
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lo que necesitas saber hoy para tomar acción.
          </p>
        </div>
        <Link to="/pos" className="hidden sm:block">
          <Button leftIcon={<Icon.Cart className="h-4 w-4" />}>Nueva venta</Button>
        </Link>
      </div>

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
              subtitle={<span className="text-slate-500">ventas completadas</span>}
            />
          </div>

          {/* Atajos rápidos a gestión financiera */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Gestión del día
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            </div>
          </div>

          {/* Tarjetas accionables */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
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
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    warning: 'bg-warning-50 text-warning-700 group-hover:bg-warning-100',
    success: 'bg-success-50 text-success-700 group-hover:bg-success-100'
  }
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-shadow hover:shadow-soft-md">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-colors', toneMap[tone])}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
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
    icon: 'bg-warning-50 text-warning-700',
    ring: 'ring-warning-100',
    button: 'bg-warning-600 hover:bg-warning-700'
  },
  danger: {
    icon: 'bg-danger-50 text-danger-700',
    ring: 'ring-danger-100',
    button: 'bg-danger-600 hover:bg-danger-700'
  },
  pink: {
    icon: 'bg-pink-50 text-pink-700',
    ring: 'ring-pink-100',
    button: 'bg-pink-600 hover:bg-pink-700'
  },
  brand: {
    icon: 'bg-brand-50 text-brand-700',
    ring: 'ring-brand-100',
    button: 'bg-brand-600 hover:bg-brand-700'
  }
}

function ActionCard({
  tone, icon, title, count, subtitle, items, emptyLabel, actionLabel, actionHref
}: ActionCardProps) {
  const s = toneStyles[tone]
  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl ring-4',
              s.icon,
              s.ring
            )}
          >
            {icon}
          </div>
        }
        title={
          <div className="flex items-baseline gap-2">
            <span>{title}</span>
            <span className="text-2xl font-bold text-slate-900">{count}</span>
          </div>
        }
        subtitle={subtitle}
      />

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map(it => (
            <li key={it.key} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="truncate flex-1 text-slate-700">{it.left}</span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  it.rightDanger ? 'text-danger-600' : 'text-slate-500'
                )}
              >
                {it.right}
              </span>
              {it.waHref && (
                <a
                  href={it.waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition"
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
        <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
      )}

      {actionLabel && actionHref && (
        <Link to={actionHref} className="mt-5">
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
