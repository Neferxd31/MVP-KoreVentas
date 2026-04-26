import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button, Icon, SkeletonCard, EmptyState } from '@/components/ui'
import { useSale } from '@/hooks/use-sales'
import { useCustomers } from '@/hooks/use-customers'
import { useSettings } from '@/hooks/use-settings'
import { formatCop } from '@/lib/utils'
import { waLink, waTemplates } from '@/lib/whatsapp'

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sale, isLoading } = useSale(id ?? null)
  const { data: customers } = useCustomers()
  const { data: settings } = useSettings()
  const businessName = settings?.businessName || 'KoreVentas'
  const logoUrl = settings?.logoUrl
  const isCustomized = businessName !== 'KoreVentas'

  const customer = sale?.customerId
    ? customers?.find(c => c.id === sale.customerId)
    : null

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <SkeletonCard />
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="Venta no encontrada"
          action={<Link to="/sales"><Button variant="outline">Volver al historial</Button></Link>}
        />
      </div>
    )
  }

  const date = new Date(sale.createdAt)
  const fecha = date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  // Mensaje WhatsApp con resumen completo
  const waMessage = customer
    ? `${waTemplates.thankYou(customer.fullName)}\n\nResumen de tu compra (${fecha} ${hora}):\n${sale.items
        .map(i => `• ${i.quantity} × ${i.productName} — ${formatCop(i.total)}`)
        .join('\n')}\n\n*Total: ${formatCop(sale.total)}*\nPago: ${sale.paymentMethod}`
    : ''
  const wa = customer?.phone ? waLink(customer.phone, waMessage) : null

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar — solo en pantalla, oculto al imprimir */}
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Icon.ChevronLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow-soft hover:bg-[#1ebe5a] transition active:scale-[0.98]"
              >
                <Icon.WhatsApp className="h-4 w-4" />
                <span className="hidden sm:inline">Compartir</span>
              </a>
            )}
            <Button
              onClick={() => window.print()}
              leftIcon={<Icon.Receipt className="h-4 w-4" />}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Recibo — esto se imprime */}
      <div className="mx-auto max-w-4xl px-4 py-6 print-a4">
        <div className="mx-auto rounded-2xl bg-white p-6 shadow-soft print:rounded-none print:p-0 print:shadow-none print-receipt sm:max-w-sm">
          {/* Encabezado */}
          <div className="text-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={businessName}
                className="mx-auto mb-2 h-14 w-14 rounded-lg object-cover"
              />
            )}
            <h1 className="text-base font-bold uppercase tracking-wider">{businessName}</h1>
            <p className="text-xs text-slate-500 print:text-black">Comprobante de venta</p>
          </div>

          <Divider />

          {/* Meta */}
          <div className="text-xs leading-relaxed">
            <Row label="Fecha" value={`${fecha}  ${hora}`} />
            <Row label="N° Venta" value={sale.id.slice(0, 8).toUpperCase()} />
            <Row label="Pago" value={sale.paymentMethod} />
            {customer && <Row label="Cliente" value={customer.fullName} />}
            {customer?.phone && <Row label="Tel." value={customer.phone} />}
          </div>

          <Divider />

          {/* Ítems */}
          <div className="text-xs">
            {sale.items.map(it => (
              <div key={it.id} className="mb-2">
                <div className="font-semibold leading-tight">
                  {it.productName}
                </div>
                <div className="flex justify-between leading-tight text-slate-600 print:text-black">
                  <span>
                    {it.quantity} × {formatCop(it.unitPrice)}
                  </span>
                  <span className="tabular-nums">{formatCop(it.total)}</span>
                </div>
              </div>
            ))}
          </div>

          <Divider />

          {/* Totales */}
          <div className="text-xs">
            <Row label="Subtotal" value={formatCop(sale.subtotal)} />
            <Row label="IVA" value={formatCop(sale.taxTotal)} />
            <div className="mt-1 flex justify-between border-t border-dashed border-slate-300 pt-1.5 text-sm font-bold">
              <span>TOTAL</span>
              <span className="tabular-nums">{formatCop(sale.total)}</span>
            </div>
          </div>

          {sale.notes && (
            <>
              <Divider />
              <p className="text-xs italic text-slate-600 print:text-black">
                {sale.notes}
              </p>
            </>
          )}

          <Divider />

          {/* Pie */}
          <p className="text-center text-[10px] text-slate-500 print:text-black">
            ¡Gracias por tu compra!<br />
            Conserva este comprobante.
          </p>

          {/* Marca de agua: solo cuando el negocio personalizó su nombre */}
          {isCustomized && (
            <p className="mt-3 text-center text-[8px] tracking-wider text-slate-400 print:text-slate-500">
              Hecho con KoreVentas
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="my-3 border-t border-dashed border-slate-300 print:border-black" />
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 print:text-black">{label}:</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
