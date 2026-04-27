import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  SkeletonCard,
  useToast
} from '@/components/ui'
import {
  useCurrentCashSession,
  useCashSessions,
  useOpenCashSession,
  useCloseCashSession
} from '@/hooks/use-cash-session'
import { cn, formatCop } from '@/lib/utils'
import type { CashSession } from '@/types/cash-session'

export default function CashPage() {
  const toast = useToast()
  const { data: current, isLoading } = useCurrentCashSession()
  const { data: history } = useCashSessions()
  const openMut = useOpenCashSession()
  const closeMut = useCloseCashSession()

  const [openingAmount, setOpeningAmount] = useState('')
  const [countedAmount, setCountedAmount] = useState('')
  const [notes, setNotes] = useState('')

  const handleOpen = () => {
    const amount = Number(openingAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error('Monto inicial inválido')
      return
    }
    openMut.mutate(
      { openingAmount: amount },
      {
        onSuccess: () => {
          toast.success('Caja abierta', formatCop(amount))
          setOpeningAmount('')
        },
        onError: (e: any) => {
          toast.error('No se pudo abrir', e?.response?.data?.message ?? '')
        }
      }
    )
  }

  const handleClose = () => {
    if (!current) return
    const counted = Number(countedAmount)
    if (isNaN(counted) || counted < 0) {
      toast.error('Monto contado inválido')
      return
    }
    if (!confirm('¿Cerrar la caja con este monto? No podrás editar después.')) return
    closeMut.mutate(
      { id: current.id, data: { countedAmount: counted, notes: notes || undefined } },
      {
        onSuccess: s => {
          const diff = Number(s.difference ?? 0)
          const tone = diff === 0 ? 'success' : diff > 0 ? 'info' : 'error'
          const msg = diff === 0
            ? 'Caja cuadrada perfecto'
            : diff > 0
              ? `Sobra ${formatCop(Math.abs(diff))}`
              : `Falta ${formatCop(Math.abs(diff))}`
          if (tone === 'success') toast.success('Caja cerrada', msg)
          else if (tone === 'info') toast.success('Caja cerrada', msg)
          else toast.error('Caja cerrada con faltante', msg)
          setCountedAmount('')
          setNotes('')
        },
        onError: () => toast.error('No se pudo cerrar la caja')
      }
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Caja diaria
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Controla el arqueo de efectivo al inicio y al cierre del día.
        </p>
      </div>

      {isLoading && <SkeletonCard />}

      {!isLoading && !current && (
        <Card className="mb-6">
          <CardHeader
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                <Icon.Unlock className="h-5 w-5" />
              </div>
            }
            title="Abrir caja"
            subtitle="Ingresa el monto inicial en efectivo para comenzar el día."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={openingAmount}
              onChange={e => setOpeningAmount(e.target.value)}
              leftIcon={<Icon.DollarSign className="h-4 w-4" />}
              label="Monto inicial"
            />
            <div className="flex items-end">
              <Button
                onClick={handleOpen}
                loading={openMut.isPending}
                leftIcon={<Icon.Unlock className="h-4 w-4" />}
                size="lg"
                fullWidth
              >
                Abrir caja
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && current && (
        <>
          {/* Arqueo en vivo */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              label="Fondo inicial"
              value={formatCop(current.openingAmount)}
              icon={<Icon.Sparkles className="h-5 w-5" />}
              tone="slate"
            />
            <StatCard
              label="Ventas en efectivo"
              value={formatCop(current.cashSalesSoFar ?? 0)}
              icon={<Icon.TrendingUp className="h-5 w-5" />}
              tone="success"
            />
            <StatCard
              label="Debería haber"
              value={formatCop(current.currentExpected ?? 0)}
              icon={<Icon.DollarSign className="h-5 w-5" />}
              tone="brand"
              highlight
            />
          </div>

          {/* Info apertura */}
          <Card className="mb-6" padding="sm">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Icon.Clock className="h-4 w-4" />
              <span>
                Caja abierta el{' '}
                <span className="font-semibold text-slate-700">
                  {new Date(current.openedAt).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </span>
            </div>
          </Card>

          {/* Cerrar caja */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-700 ring-4 ring-warning-100">
                  <Icon.Lock className="h-5 w-5" />
                </div>
              }
              title="Cerrar caja"
              subtitle="Cuenta el efectivo físicamente y registra el monto real para detectar diferencias."
            />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={countedAmount}
                onChange={e => setCountedAmount(e.target.value)}
                leftIcon={<Icon.DollarSign className="h-4 w-4" />}
                label="Monto contado"
                hint={
                  countedAmount && current.currentExpected != null
                    ? diffHint(Number(countedAmount), Number(current.currentExpected))
                    : 'Ingresa lo que tienes en caja ahora mismo.'
                }
              />
              <Input
                placeholder="Ej: descuadre por propina, vuelto..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                label="Notas (opcional)"
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleClose}
                loading={closeMut.isPending}
                leftIcon={<Icon.Lock className="h-4 w-4" />}
                variant="danger"
              >
                Cerrar caja ahora
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Historial */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Historial de cajas
        </h2>
        {(!history || history.length === 0) && (
          <EmptyState
            icon={<Icon.Receipt className="h-6 w-6" />}
            title="Sin historial todavía"
            description="Las cajas cerradas aparecerán aquí con sus diferencias."
          />
        )}
        {history && history.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Apertura</th>
                    <th className="px-5 py-3.5">Cierre</th>
                    <th className="px-5 py-3.5">Fondo</th>
                    <th className="px-5 py-3.5">Esperado</th>
                    <th className="px-5 py-3.5">Contado</th>
                    <th className="px-5 py-3.5">Diferencia</th>
                    <th className="px-5 py-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(s => (
                    <HistoryRow key={s.id} s={s} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function diffHint(counted: number, expected: number): string {
  const diff = counted - expected
  if (diff === 0) return '✓ Cuadra exacto con lo esperado.'
  if (diff > 0) return `Sobra ${formatCop(diff)} respecto a lo esperado.`
  return `Falta ${formatCop(Math.abs(diff))} respecto a lo esperado.`
}

function StatCard({
  label,
  value,
  icon,
  tone,
  highlight
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'brand' | 'success' | 'slate'
  highlight?: boolean
}) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success-50 text-success-700',
    slate: 'bg-slate-100 text-slate-600'
  }
  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        highlight && 'ring-2 ring-brand-400/40'
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneMap[tone])}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
    </Card>
  )
}

function HistoryRow({ s }: { s: CashSession }) {
  const isOpen = s.status === 'ABIERTA'
  const diff = Number(s.difference ?? 0)
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-5 py-3 text-xs text-slate-500">
        {new Date(s.openedAt).toLocaleString('es-CO', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
      <td className="px-5 py-3 text-xs text-slate-500">
        {s.closedAt
          ? new Date(s.closedAt).toLocaleString('es-CO', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : <span className="text-slate-400">—</span>}
      </td>
      <td className="px-5 py-3 tabular-nums text-slate-700">{formatCop(s.openingAmount)}</td>
      <td className="px-5 py-3 tabular-nums text-slate-700">
        {s.expectedAmount != null ? formatCop(s.expectedAmount) : '—'}
      </td>
      <td className="px-5 py-3 tabular-nums text-slate-700">
        {s.countedAmount != null ? formatCop(s.countedAmount) : '—'}
      </td>
      <td
        className={cn(
          'px-5 py-3 tabular-nums font-semibold',
          s.difference == null ? 'text-slate-400' : diff === 0 ? 'text-success-700' : diff > 0 ? 'text-brand-600' : 'text-danger-600'
        )}
      >
        {s.difference == null ? '—' : diff === 0 ? formatCop(0) : `${diff > 0 ? '+' : ''}${formatCop(diff)}`}
      </td>
      <td className="px-5 py-3">
        <Badge tone={isOpen ? 'success' : 'neutral'}>
          {isOpen ? 'Abierta' : 'Cerrada'}
        </Badge>
      </td>
    </tr>
  )
}
