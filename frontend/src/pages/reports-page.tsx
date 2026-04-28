import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  SkeletonCard,
  Badge,
  Button
} from '@/components/ui'
import {
  useReportsOverview,
  useSalesByDay,
  useTopProducts,
  useTopServices,
  useTopCustomers,
  usePaymentBreakdown,
  useEmployeePerformance,
  useAgendaHeatmap
} from '@/hooks/use-reports'
import { useProfitability } from '@/hooks/use-insights'
import { formatCop, cn } from '@/lib/utils'
import { exportCsv } from '@/lib/export'
import { useTheme } from '@/context/ThemeContext'

// Paleta consistente con el design system
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

// PostgreSQL DOW: 0=Domingo..6=Sábado. Para Latam preferimos Lun..Dom.
const DOW_LABELS: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 0: 'Dom'
}
// Orden visual (Lun..Dom)
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]

function firstOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())
  const { theme } = useTheme()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const range = { from, to }

  const overview = useReportsOverview(range)
  const salesByDay = useSalesByDay(range)
  const topProducts = useTopProducts({ ...range, limit: 5 })
  const topServices = useTopServices({ ...range, limit: 5 })
  const topCustomers = useTopCustomers({ ...range, limit: 5 })
  const byPayment = usePaymentBreakdown(range)
  const employees = useEmployeePerformance(range)
  const heatmap = useAgendaHeatmap(range)
  const profitability = useProfitability({ ...range, limit: 10 })

  const handleExportCsv = () => {
    const suffix = `${from}_${to}`

    if (overview.data) {
      exportCsv(
        [{
          ingresos: overview.data.revenue,
          gastos: overview.data.expenses,
          utilidadNeta: overview.data.netProfit,
          ordenes: overview.data.orderCount,
          ticketPromedio: overview.data.averageTicket
        }],
        `reporte-resumen-${suffix}.csv`,
        [
          { key: 'ingresos', label: 'Ingresos' },
          { key: 'gastos', label: 'Gastos' },
          { key: 'utilidadNeta', label: 'Utilidad neta' },
          { key: 'ordenes', label: 'Órdenes' },
          { key: 'ticketPromedio', label: 'Ticket promedio' }
        ]
      )
    }

    if (salesByDay.data && salesByDay.data.length > 0) {
      exportCsv(
        salesByDay.data,
        `reporte-ventas-por-dia-${suffix}.csv`,
        [
          { key: 'date', label: 'Fecha' },
          { key: 'count', label: 'Ventas' },
          { key: 'total', label: 'Total' }
        ]
      )
    }

    if (topProducts.data && topProducts.data.length > 0) {
      exportCsv(
        topProducts.data,
        `reporte-top-productos-${suffix}.csv`,
        [
          { key: 'name', label: 'Producto' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'total', label: 'Total' }
        ]
      )
    }

    if (topServices.data && topServices.data.length > 0) {
      exportCsv(
        topServices.data,
        `reporte-top-servicios-${suffix}.csv`,
        [
          { key: 'name', label: 'Servicio' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'total', label: 'Total' }
        ]
      )
    }

    if (topCustomers.data && topCustomers.data.length > 0) {
      exportCsv(
        topCustomers.data,
        `reporte-top-clientes-${suffix}.csv`,
        [
          { key: 'name', label: 'Cliente' },
          { key: 'phone', label: 'Teléfono' },
          { key: 'orders', label: 'Órdenes' },
          { key: 'total', label: 'Total' }
        ]
      )
    }

    if (byPayment.data && byPayment.data.length > 0) {
      exportCsv(
        byPayment.data,
        `reporte-metodos-pago-${suffix}.csv`,
        [
          { key: 'method', label: 'Método' },
          { key: 'count', label: 'Ventas' },
          { key: 'total', label: 'Total' }
        ]
      )
    }

    if (employees.data && employees.data.length > 0) {
      exportCsv(
        employees.data,
        `reporte-empleados-${suffix}.csv`,
        [
          { key: 'name', label: 'Empleado' },
          { key: 'completed', label: 'Completadas' },
          { key: 'total', label: 'Total citas' }
        ]
      )
    }

    if (profitability.data && profitability.data.length > 0) {
      exportCsv(
        profitability.data,
        `reporte-rentabilidad-${suffix}.csv`,
        [
          { key: 'name', label: 'Producto' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'price', label: 'Precio' },
          { key: 'cost', label: 'Costo' },
          { key: 'marginPct', label: 'Margen %' },
          { key: 'revenue', label: 'Ingresos' },
          { key: 'grossProfit', label: 'Utilidad bruta' }
        ]
      )
    }
  }

  const netProfitTone =
    (overview.data?.netProfit ?? 0) >= 0 ? 'text-success-700 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 8,
    fontSize: 12,
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl transition-colors">
          Reportes
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          Analiza el desempeño de tu negocio con datos reales.
        </p>
      </div>

      {/* Rango + exportación */}
      <Card className="mb-6 no-print dark:bg-slate-900 dark:border-slate-800 transition-colors" padding="sm">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            type="date"
            label="Desde"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
          <Input
            type="date"
            label="Hasta"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
          <div className="ml-auto flex flex-wrap items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon.Receipt className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon.BarChart className="h-4 w-4" />}
              onClick={() => handleExportCsv()}
            >
              Exportar Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview */}
      {overview.isLoading && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} className="dark:bg-slate-900" />)}
        </div>
      )}
      {overview.data && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Ingresos"
            value={formatCop(overview.data.revenue)}
            icon={<Icon.TrendingUp className="h-5 w-5" />}
            tone="brand"
          />
          <MetricCard
            label="Gastos"
            value={formatCop(overview.data.expenses)}
            icon={<Icon.Receipt className="h-5 w-5" />}
            tone="danger"
          />
          <MetricCard
            label="Utilidad neta"
            value={formatCop(overview.data.netProfit)}
            icon={<Icon.DollarSign className="h-5 w-5" />}
            tone="success"
            valueClass={netProfitTone}
          />
          <MetricCard
            label="Órdenes"
            value={String(overview.data.orderCount)}
            icon={<Icon.Cart className="h-5 w-5" />}
            tone="slate"
          />
          <MetricCard
            label="Ticket promedio"
            value={formatCop(overview.data.averageTicket)}
            icon={<Icon.Sparkles className="h-5 w-5" />}
            tone="purple"
          />
        </div>
      )}

      {/* Ventas por día */}
      <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <CardHeader
          icon={<ChartIconBox tone="brand"><Icon.TrendingUp className="h-5 w-5" /></ChartIconBox>}
          title={<span className="text-slate-800 dark:text-white">Ventas por día</span>}
          subtitle={<span className="text-slate-500 dark:text-slate-400">Evolución del total vendido en el período</span>}
        />
        <div className="mt-5 h-72 w-full">
          {salesByDay.isLoading ? (
            <SkeletonCard />
          ) : (salesByDay.data?.length ?? 0) === 0 ? (
            <EmptyInline label="Sin ventas en el período" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(v: any) => formatCop(Number(v)).replace('$', '')}
                  width={80}
                />
                <Tooltip
                  formatter={(v: any) => formatCop(Number(v))}
                  labelFormatter={(d: any) => formatShortDate(String(d))}
                  contentStyle={tooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Top productos y servicios */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <CardHeader
            icon={<ChartIconBox tone="success"><Icon.Package className="h-5 w-5" /></ChartIconBox>}
            title={<span className="text-slate-800 dark:text-white">Top productos</span>}
            subtitle={<span className="text-slate-500 dark:text-slate-400">Los más vendidos del período</span>}
          />
          <div className="mt-5 h-64">
            {topProducts.isLoading ? (
              <SkeletonCard />
            ) : (topProducts.data?.length ?? 0) === 0 ? (
              <EmptyInline label="Sin productos vendidos" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.data} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(v: any) => formatCop(Number(v)).replace('$', '')} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} width={100} />
                  <Tooltip formatter={(v: any) => formatCop(Number(v))} contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <CardHeader
            icon={<ChartIconBox tone="pink"><Icon.Scissors className="h-5 w-5" /></ChartIconBox>}
            title={<span className="text-slate-800 dark:text-white">Top servicios</span>}
            subtitle={<span className="text-slate-500 dark:text-slate-400">Los más solicitados del período</span>}
          />
          <div className="mt-5 h-64">
            {topServices.isLoading ? (
              <SkeletonCard />
            ) : (topServices.data?.length ?? 0) === 0 ? (
              <EmptyInline label="Sin servicios completados" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices.data} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(v: any) => formatCop(Number(v)).replace('$', '')} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} width={100} />
                  <Tooltip formatter={(v: any) => formatCop(Number(v))} contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Métodos de pago + Top clientes */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <CardHeader
            icon={<ChartIconBox tone="brand"><Icon.PieChart className="h-5 w-5" /></ChartIconBox>}
            title={<span className="text-slate-800 dark:text-white">Métodos de pago</span>}
            subtitle={<span className="text-slate-500 dark:text-slate-400">Distribución del ingreso por forma de pago</span>}
          />
          <div className="mt-5 h-64">
            {byPayment.isLoading ? (
              <SkeletonCard />
            ) : (byPayment.data?.length ?? 0) === 0 ? (
              <EmptyInline label="Sin ingresos registrados" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPayment.data}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ method, percent }) => `${method} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {byPayment.data!.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke={isDark ? '#0f172a' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCop(Number(v))} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <CardHeader
            icon={<ChartIconBox tone="purple"><Icon.Star className="h-5 w-5" /></ChartIconBox>}
            title={<span className="text-slate-800 dark:text-white">Top clientes</span>}
            subtitle={<span className="text-slate-500 dark:text-slate-400">Los que más han gastado en el período</span>}
          />
          <div className="mt-5">
            {topCustomers.isLoading && <SkeletonCard />}
            {!topCustomers.isLoading && (topCustomers.data?.length ?? 0) === 0 && (
              <EmptyInline label="Sin clientes identificados" />
            )}
            {topCustomers.data && topCustomers.data.length > 0 && (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                {topCustomers.data.map((c: any, i: number) => (
                  <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-800 dark:text-slate-200 transition-colors">{c.name}</div>
                        {c.phone && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{c.phone}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums transition-colors">{formatCop(c.total)}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{c.orders} órdenes</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Desempeño de empleados */}
      <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <CardHeader
          icon={<ChartIconBox tone="success"><Icon.UserCheck className="h-5 w-5" /></ChartIconBox>}
          title={<span className="text-slate-800 dark:text-white">Desempeño del equipo</span>}
          subtitle={<span className="text-slate-500 dark:text-slate-400">Citas completadas y totales por empleado</span>}
        />
        <div className="mt-5">
          {employees.isLoading && <SkeletonCard />}
          {!employees.isLoading && (employees.data?.length ?? 0) === 0 && (
            <EmptyInline label="Sin empleados con actividad" />
          )}
          {employees.data && employees.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
                  <tr>
                    <th className="pb-3">Empleado</th>
                    <th className="pb-3 text-center">Completadas</th>
                    <th className="pb-3 text-center">Total</th>
                    <th className="pb-3">Tasa de cumplimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                  {employees.data.map((e: any) => {
                    const rate = e.total > 0 ? (e.completed / e.total) * 100 : 0
                    return (
                      <tr key={e.id}>
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200 transition-colors">{e.name}</td>
                        <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300 transition-colors">{e.completed}</td>
                        <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300 transition-colors">{e.total}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 transition-colors">
                              <div
                                className="h-full rounded-full bg-success-500"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums transition-colors">
                              {rate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Rentabilidad por producto */}
      <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <CardHeader
          icon={<ChartIconBox tone="success"><Icon.DollarSign className="h-5 w-5" /></ChartIconBox>}
          title={<span className="text-slate-800 dark:text-white">Productos más rentables</span>}
          subtitle={<span className="text-slate-500 dark:text-slate-400">Ordenados por utilidad bruta (margen × cantidad vendida). Solo aparecen productos con costo definido.</span>}
        />
        <div className="mt-5">
          {profitability.isLoading && <SkeletonCard />}
          {!profitability.isLoading && (profitability.data?.length ?? 0) === 0 && (
            <EmptyInline label="Define el costo de tus productos para ver utilidad real" />
          )}
          {profitability.data && profitability.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
                  <tr>
                    <th className="pb-3">Producto</th>
                    <th className="pb-3 text-center">Cant.</th>
                    <th className="pb-3 text-right">Ingresos</th>
                    <th className="pb-3 text-center">Margen</th>
                    <th className="pb-3 text-right">Utilidad bruta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                  {profitability.data.map((p: any) => {
                    const m = Number(p.marginPct)
                    const tone: 'success' | 'warning' | 'danger' =
                      m >= 30 ? 'success' : m >= 15 ? 'warning' : 'danger'
                    return (
                      <tr key={p.id}>
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200 transition-colors">{p.name}</td>
                        <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300 transition-colors">{p.quantity}</td>
                        <td className="py-3 text-right tabular-nums text-slate-600 dark:text-slate-400 transition-colors">{formatCop(p.revenue)}</td>
                        <td className="py-3 text-center">
                          <Badge tone={tone} size="sm">{m.toFixed(0)}%</Badge>
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums text-success-700 dark:text-success-400 transition-colors">
                          {formatCop(p.grossProfit)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Heatmap de agenda */}
      <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <CardHeader
          icon={<ChartIconBox tone="warning"><Icon.Calendar className="h-5 w-5" /></ChartIconBox>}
          title={<span className="text-slate-800 dark:text-white">Mapa de calor de la agenda</span>}
          subtitle={<span className="text-slate-500 dark:text-slate-400">Cuándo se llena más tu negocio (día × hora)</span>}
        />
        <div className="mt-5">
          {heatmap.isLoading && <SkeletonCard />}
          {!heatmap.isLoading && (heatmap.data?.length ?? 0) === 0 && (
            <EmptyInline label="Sin citas en el período" />
          )}
          {heatmap.data && heatmap.data.length > 0 && (
            <Heatmap cells={heatmap.data} isDark={isDark} />
          )}
        </div>
      </Card>
    </div>
  )
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function ChartIconBox({ tone, children }: { tone: 'brand' | 'success' | 'pink' | 'purple' | 'warning'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:ring-brand-900/50',
    success: 'bg-success-50 text-success-700 ring-success-100 dark:bg-success-900/30 dark:text-success-400 dark:ring-success-900/50',
    pink: 'bg-pink-50 text-pink-700 ring-pink-100 dark:bg-pink-900/30 dark:text-pink-400 dark:ring-pink-900/50',
    purple: 'bg-purple-50 text-purple-700 ring-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-900/50',
    warning: 'bg-warning-50 text-warning-700 ring-warning-100 dark:bg-warning-900/30 dark:text-warning-400 dark:ring-warning-900/50'
  }
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-4 transition-colors ${map[tone]}`}>
      {children}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  tone,
  valueClass
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'brand' | 'success' | 'danger' | 'slate' | 'purple'
  valueClass?: string
}) {
  const toneMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
    danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
  }
  return (
    <Card className="relative overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-tight tabular-nums transition-colors ${valueClass ?? 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </Card>
  )
}

function EmptyInline({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[150px] items-center justify-center">
      <EmptyState icon={<Icon.BarChart className="h-6 w-6" />} title={label} />
    </div>
  )
}

function Heatmap({ cells, isDark }: { cells: { dow: number; hour: number; count: number }[], isDark: boolean }) {
  // Horas a mostrar: 8am..9pm (rango típico de atención)
  const hours = useMemo(() => {
    const used = new Set(cells.map(c => c.hour))
    // extiende al rango mínimo 8-20 + cualquier hora usada fuera de ahí
    const base = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    used.forEach(h => { if (!base.includes(h)) base.push(h) })
    return base.sort((a, b) => a - b)
  }, [cells])

  const map = new Map<string, number>()
  let max = 0
  cells.forEach(c => {
    map.set(`${c.dow}-${c.hour}`, c.count)
    if (c.count > max) max = c.count
  })

  const intensity = (n: number) => {
    if (max === 0 || n === 0) return 0
    return n / max
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex">
          <div className="w-12" />
          {DOW_ORDER.map(d => (
            <div key={d} className="flex-1 min-w-[44px] text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 transition-colors">
              {DOW_LABELS[d]}
            </div>
          ))}
        </div>
        {hours.map(h => (
          <div key={h} className="flex items-center">
            <div className="w-12 text-right pr-2 text-[11px] tabular-nums text-slate-400 dark:text-slate-500 transition-colors">
              {h}:00
            </div>
            {DOW_ORDER.map(d => {
              const count = map.get(`${d}-${h}`) ?? 0
              const i = intensity(count)
              const bg = i === 0
                ? (isDark ? '#1e293b' : '#f1f5f9') // Fondo vacío (slate-800 osc | slate-100 claro)
                : `rgba(99, 102, 241, ${Math.max(isDark ? 0.25 : 0.15, i)})` // Indigo brand
              
              return (
                <div
                  key={d}
                  className="flex-1 min-w-[44px] p-1"
                  title={`${DOW_LABELS[d]} ${h}:00 — ${count} citas`}
                >
                  <div
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold transition-colors"
                    style={{
                      backgroundColor: bg,
                      color: i > 0.5 ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569')
                    }}
                  >
                    {count > 0 ? count : ''}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}