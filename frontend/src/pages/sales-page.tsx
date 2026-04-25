import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  SkeletonRows
} from '@/components/ui'
import { useSearchSales } from '@/hooks/use-sales'
import { useCustomers } from '@/hooks/use-customers'
import { useProducts } from '@/hooks/use-products'
import { useServices } from '@/hooks/use-services'
import { cn, formatCop } from '@/lib/utils'
import { waLink, waTemplates } from '@/lib/whatsapp'
import type { SaleResponse } from '@/types/sale'

const PAYMENT_METHODS = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA', 'TARJETA'] as const

const paymentTone: Record<string, 'success' | 'info' | 'purple' | 'warning' | 'brand'> = {
  EFECTIVO: 'success',
  NEQUI: 'purple',
  DAVIPLATA: 'warning',
  TRANSFERENCIA: 'info',
  TARJETA: 'brand'
}

function firstOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function SalesPage() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selected, setSelected] = useState<SaleResponse | null>(null)

  const { data: sales, isLoading } = useSearchSales({
    from, to, customerId, productId, serviceId, paymentMethod
  })
  const { data: customers } = useCustomers()
  const { data: products } = useProducts()
  const { data: services } = useServices()

  const customerById = useMemo(() => {
    const m = new Map<string, { fullName: string; phone: string | null }>()
    customers?.forEach(c => m.set(c.id, { fullName: c.fullName, phone: c.phone }))
    return m
  }, [customers])

  const totals = useMemo(() => {
    if (!sales) return { count: 0, sum: 0, avg: 0 }
    const sum = sales.reduce((acc, s) => acc + Number(s.total), 0)
    return {
      count: sales.length,
      sum,
      avg: sales.length > 0 ? sum / sales.length : 0
    }
  }, [sales])

  const clearFilters = () => {
    setCustomerId('')
    setProductId('')
    setServiceId('')
    setPaymentMethod('')
  }

  const hasActiveFilters = customerId || productId || serviceId || paymentMethod

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Historial de ventas
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulta todas las ventas con filtros por fecha, cliente, producto o método de pago.
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6" padding="sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Cliente</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            >
              <option value="">Todos</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Producto</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={productId}
              onChange={e => { setProductId(e.target.value); if (e.target.value) setServiceId('') }}
            >
              <option value="">Todos</option>
              {products?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Servicio</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={serviceId}
              onChange={e => { setServiceId(e.target.value); if (e.target.value) setProductId('') }}
            >
              <option value="">Todos</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Método pago</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="">Todos</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              leftIcon={<Icon.X className="h-3.5 w-3.5" />}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Resumen del rango */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Ventas" value={String(totals.count)} icon={<Icon.Cart className="h-4 w-4" />} />
        <SummaryCard label="Total" value={formatCop(totals.sum)} icon={<Icon.TrendingUp className="h-4 w-4" />} />
        <SummaryCard label="Ticket promedio" value={formatCop(totals.avg)} icon={<Icon.Sparkles className="h-4 w-4" />} />
      </div>

      {/* Tabla */}
      {isLoading && (
        <Card padding="sm">
          <SkeletonRows rows={6} cols={6} />
        </Card>
      )}

      {!isLoading && (!sales || sales.length === 0) && (
        <EmptyState
          icon={<Icon.Receipt className="h-6 w-6" />}
          title="Sin ventas para estos filtros"
          description="Ajusta el rango de fechas o limpia los filtros para ver más resultados."
        />
      )}

      {!isLoading && sales && sales.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5 text-center">Ítems</th>
                  <th className="px-5 py-3.5">Pago</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map(s => {
                  const cust = s.customerId ? customerById.get(s.customerId) : null
                  const date = new Date(s.createdAt)
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50/60"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-5 py-3 text-xs text-slate-500 tabular-nums">
                        {date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        <div className="text-[11px] text-slate-400">
                          {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {cust ? (
                          <div>
                            <div className="font-medium text-slate-800">{cust.fullName}</div>
                            {cust.phone && <div className="text-xs text-slate-400">{cust.phone}</div>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin cliente</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center tabular-nums text-slate-700">
                        {s.items.length}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={paymentTone[s.paymentMethod] ?? 'neutral'} size="sm">
                          {s.paymentMethod}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800 tabular-nums">
                        {formatCop(s.total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); setSelected(s) }}
                          leftIcon={<Icon.Receipt className="h-3.5 w-3.5" />}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal detalle */}
      {selected && (
        <SaleDetailModal
          sale={selected}
          customer={selected.customerId ? customerById.get(selected.customerId) ?? null : null}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function SaleDetailModal({
  sale,
  customer,
  onClose
}: {
  sale: SaleResponse
  customer: { fullName: string; phone: string | null } | null
  onClose: () => void
}) {
  const date = new Date(sale.createdAt)
  // Plantilla WhatsApp: agradecimiento con resumen de la venta
  const waMessage = customer
    ? `${waTemplates.thankYou(customer.fullName)}\n\nResumen de tu compra:\n${sale.items
        .map(i => `• ${i.quantity} × ${i.productName} — ${formatCop(i.total)}`)
        .join('\n')}\n\n*Total: ${formatCop(sale.total)}*`
    : ''
  const wa = customer?.phone ? waLink(customer.phone, waMessage) : null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-800">Detalle de venta</h2>
            <p className="text-sm text-slate-500">
              {date.toLocaleString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon.X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-y border-slate-100 py-4 text-sm">
          {customer ? (
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente</span>
              <span className="font-medium text-slate-700">{customer.fullName}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente</span>
              <span className="text-slate-400">Sin cliente identificado</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Método de pago</span>
            <Badge tone={paymentTone[sale.paymentMethod] ?? 'neutral'} size="sm">
              {sale.paymentMethod}
            </Badge>
          </div>
          {sale.notes && (
            <div>
              <p className="text-slate-500">Notas</p>
              <p className="mt-1 text-slate-700">{sale.notes}</p>
            </div>
          )}
        </div>

        {/* Ítems */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ítems ({sale.items.length})
          </p>
          <ul className="divide-y divide-slate-100">
            {sale.items.map(it => (
              <li key={it.id} className="py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{it.productName}</p>
                    <p className="text-xs text-slate-500">
                      {it.quantity} × {formatCop(it.unitPrice)}
                      {Number(it.taxRate) > 0 && (
                        <span className="ml-2 text-slate-400">
                          IVA {(Number(it.taxRate) * 100).toFixed(0)}%
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatCop(it.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Totales */}
        <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCop(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>IVA</span>
            <span className="tabular-nums">{formatCop(sale.taxTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="tabular-nums">{formatCop(sale.total)}</span>
          </div>
        </div>

        {/* Acciones */}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-soft',
              'transition hover:bg-[#1ebe5a] active:scale-[0.98]'
            )}
          >
            <Icon.WhatsApp className="h-4 w-4" />
            Enviar resumen por WhatsApp
          </a>
        )}
      </Card>
    </div>
  )
}
