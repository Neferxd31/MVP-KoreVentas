import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Icon,
  Input,
  SkeletonCard,
  useToast
} from '@/components/ui'
import { useCurrentGoal, useUpsertGoal } from '@/hooks/use-goal'
import { cn, formatCop } from '@/lib/utils'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

export default function GoalsPage() {
  const toast = useToast()
  const { data: goal, isLoading } = useCurrentGoal()
  const upsert = useUpsertGoal()

  const [revenueTarget, setRevenueTarget] = useState('')
  const [ordersTarget, setOrdersTarget] = useState('')

  useEffect(() => {
    if (goal && goal.goalSet) {
      setRevenueTarget(String(goal.revenueTarget))
      setOrdersTarget(String(goal.ordersTarget))
    }
  }, [goal])

  const handleSave = () => {
    if (!goal) return
    const rt = Number(revenueTarget)
    const ot = Number(ordersTarget)
    if (isNaN(rt) || rt < 0) { toast.error('Meta de ingresos inválida'); return }
    if (isNaN(ot) || ot < 0) { toast.error('Meta de órdenes inválida'); return }

    upsert.mutate(
      { year: goal.year, month: goal.month, revenueTarget: rt, ordersTarget: ot },
      {
        onSuccess: () => toast.success('Meta guardada', `Para ${MONTH_NAMES[goal.month - 1]}`),
        onError: () => toast.error('No se pudo guardar')
      }
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Metas del mes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Define cuánto quieres facturar este mes y mide el avance día a día.
        </p>
      </div>

      {isLoading && <SkeletonCard />}

      {goal && (
        <>
          {/* Progreso visual */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                  <Icon.TrendingUp className="h-5 w-5" />
                </div>
              }
              title={`${MONTH_NAMES[goal.month - 1].toUpperCase()} ${goal.year}`}
              subtitle={`Día ${goal.dayOfMonth} de ${goal.daysInMonth}`}
            />

            {goal.goalSet ? (
              <ProgressBlock goal={goal} />
            ) : (
              <p className="mt-5 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
                Aún no has fijado meta para este mes. Define una abajo y empezamos a medir.
              </p>
            )}
          </Card>

          {/* Formulario */}
          <Card>
            <CardHeader
              title={goal.goalSet ? 'Ajustar meta' : 'Definir meta'}
              subtitle="Puedes editarla en cualquier momento."
            />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                type="number"
                inputMode="decimal"
                label="Meta de ingresos"
                placeholder="3000000"
                value={revenueTarget}
                onChange={e => setRevenueTarget(e.target.value)}
                leftIcon={<Icon.DollarSign className="h-4 w-4" />}
                hint={
                  revenueTarget
                    ? `Equivale a ${formatCop(Number(revenueTarget) / goal.daysInMonth)} / día`
                    : 'Cuánto quieres facturar este mes'
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                label="Meta de órdenes (opcional)"
                placeholder="100"
                value={ordersTarget}
                onChange={e => setOrdersTarget(e.target.value)}
                leftIcon={<Icon.Cart className="h-4 w-4" />}
                hint={
                  ordersTarget
                    ? `${(Number(ordersTarget) / goal.daysInMonth).toFixed(1)} ventas / día en promedio`
                    : 'Número total de ventas'
                }
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={handleSave} loading={upsert.isPending}>
                {goal.goalSet ? 'Actualizar meta' : 'Crear meta'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function ProgressBlock({ goal }: { goal: import('@/types/goal').GoalProgress }) {
  const revenuePct = goal.revenueTarget > 0
    ? Math.min(100, (goal.revenueSoFar / goal.revenueTarget) * 100)
    : 0
  const expectedPct = (goal.dayOfMonth / goal.daysInMonth) * 100
  const isAhead = revenuePct >= expectedPct

  const projectionPct = goal.revenueTarget > 0
    ? (goal.projectedRevenue / goal.revenueTarget) * 100
    : 0

  const remaining = Math.max(0, goal.revenueTarget - goal.revenueSoFar)
  const daysLeft = goal.daysInMonth - goal.dayOfMonth
  const dailyNeeded = daysLeft > 0 ? remaining / daysLeft : remaining

  return (
    <div className="mt-5 space-y-5">
      {/* Barra de ingresos */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-slate-700">Ingresos</span>
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            isAhead ? 'text-success-700' : 'text-warning-700'
          )}>
            {revenuePct.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
          {/* Marca del día esperado */}
          <div
            className="absolute top-0 h-full w-px bg-slate-400/60"
            style={{ left: `${expectedPct}%` }}
            title={`Hoy deberías ir en ${expectedPct.toFixed(0)}%`}
          />
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isAhead ? 'bg-success-500' : 'bg-warning-500'
            )}
            style={{ width: `${revenuePct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span className="tabular-nums">{formatCop(goal.revenueSoFar)}</span>
          <span className="tabular-nums">Meta: {formatCop(goal.revenueTarget)}</span>
        </div>
      </div>

      {/* Proyección */}
      <div className="rounded-xl bg-slate-50 p-4 text-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          A este ritmo terminarás en
        </p>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">
          {formatCop(goal.projectedRevenue)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {projectionPct >= 100 ? (
            <span className="text-success-700">
              🚀 Vas a superar la meta en {(projectionPct - 100).toFixed(0)}%. Sigue así.
            </span>
          ) : (
            <span className="text-warning-700">
              ⚠️ Te faltarían {formatCop(goal.revenueTarget - goal.projectedRevenue)} para la meta.
              Necesitas {formatCop(dailyNeeded)} / día los próximos {daysLeft} días.
            </span>
          )}
        </p>
      </div>

      {/* Órdenes */}
      {goal.ordersTarget > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Órdenes hechas" value={String(goal.ordersSoFar)} />
          <Stat label="Meta de órdenes" value={String(goal.ordersTarget)} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  )
}
