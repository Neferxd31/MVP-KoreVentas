import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  SkeletonRows,
  useToast
} from '@/components/ui'
import {
  useExpenses,
  useExpenseCategories,
  useExpensesSummary,
  useCreateExpense,
  useDeleteExpense,
  useCreateExpenseCategory
} from '@/hooks/use-expenses'
import { cn, formatCop } from '@/lib/utils'
import type { Expense, CreateExpenseRequest } from '@/types/expense'

const PAYMENT_METHODS = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA', 'TARJETA'] as const

function firstOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function ExpensesPage() {
  const toast = useToast()
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())

  const { data: expenses, isLoading } = useExpenses({ from, to })
  const { data: summary } = useExpensesSummary({ from, to })
  const { data: categories } = useExpenseCategories()
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()
  const createCategory = useCreateExpenseCategory()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateExpenseRequest>({
    description: '',
    amount: 0,
    paymentMethod: 'EFECTIVO',
    expenseDate: today()
  })
  const [newCategory, setNewCategory] = useState('')

  const total = summary?.total ?? 0

  const categoryById = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>()
    categories?.forEach(c => m.set(c.id, { name: c.name, color: c.color }))
    return m
  }, [categories])

  const handleCreate = () => {
    if (!form.description.trim()) {
      toast.error('Ingresa una descripción')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Monto inválido')
      return
    }
    createExpense.mutate(
      {
        ...form,
        amount: Number(form.amount),
        categoryId: form.categoryId || undefined
      },
      {
        onSuccess: () => {
          toast.success('Gasto registrado', formatCop(Number(form.amount)))
          setForm({
            description: '',
            amount: 0,
            paymentMethod: 'EFECTIVO',
            expenseDate: today()
          })
          setShowForm(false)
        },
        onError: () => toast.error('No se pudo registrar')
      }
    )
  }

  const handleDelete = (e: Expense) => {
    if (!confirm(`¿Eliminar gasto "${e.description}"?`)) return
    deleteExpense.mutate(e.id, {
      onSuccess: () => toast.success('Gasto eliminado'),
      onError: () => toast.error('No se pudo eliminar')
    })
  }

  const handleCreateCategory = () => {
    const name = newCategory.trim()
    if (!name) return
    createCategory.mutate(
      { name },
      {
        onSuccess: c => {
          toast.success('Categoría creada', c.name)
          setForm(f => ({ ...f, categoryId: c.id }))
          setNewCategory('')
        },
        onError: () => toast.error('No se pudo crear la categoría')
      }
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gastos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Registra los costos del negocio para calcular utilidad real.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Nuevo gasto
          </Button>
        )}
      </div>

      {/* Rango */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            type="date"
            label="Desde"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="md:w-auto"
          />
          <Input
            type="date"
            label="Hasta"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-500">Total en el período</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{formatCop(total)}</p>
          </div>
        </div>
      </Card>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader
            title="Registrar gasto"
            subtitle="Descripción corta y monto. Categoría opcional."
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Input
              label="Descripción"
              placeholder="Ej: Arriendo, compra de insumos..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Input
              type="number"
              inputMode="decimal"
              label="Monto"
              placeholder="0"
              value={form.amount || ''}
              onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              leftIcon={<Icon.DollarSign className="h-4 w-4" />}
            />
            <Input
              type="date"
              label="Fecha"
              value={form.expenseDate || today()}
              onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Método de pago
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, categoryId: undefined }))}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                    !form.categoryId
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  )}
                >
                  Sin categoría
                </button>
                {categories?.map(c => {
                  const active = form.categoryId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, categoryId: c.id }))}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition',
                        active
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </button>
                  )
                })}
              </div>
              {/* Crear categoría inline */}
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Nueva categoría (ej: Arriendo, Insumos...)"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleCreateCategory}
                  loading={createCategory.isPending}
                  disabled={!newCategory.trim()}
                  leftIcon={<Icon.Plus className="h-4 w-4" />}
                >
                  Crear
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={createExpense.isPending}>
              Registrar gasto
            </Button>
          </div>
        </Card>
      )}

      {/* Desglose por categoría */}
      {summary && summary.byCategory.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Desglose por categoría
          </h2>
          <Card padding="sm">
            <ul className="divide-y divide-slate-100">
              {summary.byCategory.map(c => {
                const pct = total > 0 ? (c.total / total) * 100 : 0
                const color = c.categoryId ? categoryById.get(c.categoryId)?.color ?? '#64748b' : '#94a3b8'
                return (
                  <li key={c.categoryId ?? 'none'} className="py-3">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-slate-700">{c.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 tabular-nums">{pct.toFixed(1)}%</span>
                        <span className="font-semibold text-slate-800 tabular-nums">{formatCop(c.total)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      )}

      {/* Lista */}
      {isLoading && (
        <Card padding="sm">
          <SkeletonRows rows={4} cols={5} />
        </Card>
      )}

      {!isLoading && (!expenses || expenses.length === 0) && (
        <EmptyState
          icon={<Icon.Receipt className="h-6 w-6" />}
          title="No hay gastos en este período"
          description="Registra tus costos para ver la utilidad neta del negocio."
          action={
            <Button onClick={() => setShowForm(true)} leftIcon={<Icon.Plus className="h-4 w-4" />}>
              Registrar primer gasto
            </Button>
          }
        />
      )}

      {!isLoading && expenses && expenses.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5">Método</th>
                  <th className="px-5 py-3.5 text-right">Monto</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => {
                  const cat = e.categoryId ? categoryById.get(e.categoryId) : null
                  return (
                    <tr key={e.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-xs text-slate-500 tabular-nums">
                        {new Date(e.expenseDate).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{e.description}</div>
                        {e.notes && (
                          <div className="text-xs text-slate-400">{e.notes}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Sin categoría</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{e.paymentMethod}</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800 tabular-nums">
                        {formatCop(e.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(e)}
                          leftIcon={<Icon.Trash className="h-3.5 w-3.5" />}
                          className="hover:bg-danger-50 hover:text-danger-600"
                        >
                          Quitar
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
    </div>
  )
}
