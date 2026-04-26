import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  SkeletonRows,
  useToast
} from '@/components/ui'
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer
} from '@/hooks/use-customers'
import CustomerForm from '@/components/customer-form'
import { cn, formatCop } from '@/lib/utils'
import { waLink, waTemplates } from '@/lib/whatsapp'
import type { Customer, CreateCustomerRequest } from '@/types/customer'

type TagKey = 'NUEVO' | 'FRECUENTE' | 'VIP' | 'INACTIVO'

const tagConfig: Record<TagKey, { label: string; tone: 'info' | 'success' | 'purple' | 'danger' }> = {
  NUEVO: { label: 'Nuevo', tone: 'info' },
  FRECUENTE: { label: 'Frecuente', tone: 'success' },
  VIP: { label: 'VIP', tone: 'purple' },
  INACTIVO: { label: 'Inactivo', tone: 'danger' }
}

export default function CustomersPage() {
  const toast = useToast()
  const { data: customers, isLoading, isError } = useCustomers()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<'ALL' | TagKey>('ALL')

  const filtered = customers?.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase())
      || (c.phone?.includes(search) ?? false)
    const matchesTag = filterTag === 'ALL' || c.autoTag === filterTag
    return matchesSearch && matchesTag
  }) ?? []

  const handleCreate = (data: CreateCustomerRequest) => {
    createCustomer.mutate(data, {
      onSuccess: () => { toast.success('Cliente creado', data.fullName); setShowForm(false) },
      onError: () => toast.error('No se pudo crear el cliente')
    })
  }

  const handleUpdate = (data: CreateCustomerRequest) => {
    if (!editing) return
    updateCustomer.mutate({ id: editing.id, data }, {
      onSuccess: () => { toast.success('Cliente actualizado'); setEditing(null); setShowForm(false) },
      onError: () => toast.error('No se pudo actualizar')
    })
  }

  const handleDelete = (c: Customer) => {
    if (!confirm(`¿Eliminar a "${c.fullName}"?`)) return
    deleteCustomer.mutate(c.id, {
      onSuccess: () => toast.success('Cliente eliminado'),
      onError: () => toast.error('No se pudo eliminar')
    })
  }

  const tagCounts = customers?.reduce((acc, c) => {
    acc[c.autoTag] = (acc[c.autoTag] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {customers?.length ?? 0} clientes registrados
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => { setEditing(null); setShowForm(true) }}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Nuevo cliente
          </Button>
        )}
      </div>

      {/* Resumen de etiquetas (filtro) */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['NUEVO', 'FRECUENTE', 'VIP', 'INACTIVO'] as const).map(tag => {
          const active = filterTag === tag
          const cfg = tagConfig[tag]
          return (
            <button
              key={tag}
              onClick={() => setFilterTag(active ? 'ALL' : tag)}
              className={cn(
                'group rounded-2xl border p-4 text-left transition-all',
                active
                  ? 'border-brand-400 bg-brand-50/50 shadow-soft-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft-md'
              )}
            >
              <Badge tone={cfg.tone} size="sm">{cfg.label}</Badge>
              <p className="mt-2 text-2xl font-bold text-slate-900">{tagCounts[tag] || 0}</p>
              {active && (
                <p className="mt-0.5 text-[11px] font-medium text-brand-600">✓ Filtrando</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {editing ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <CustomerForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setEditing(null); setShowForm(false) }}
            loading={createCustomer.isPending || updateCustomer.isPending}
          />
        </Card>
      )}

      {/* Búsqueda */}
      <div className="mb-4">
        <Input
          leftIcon={<Icon.Search className="h-4 w-4" />}
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      {isLoading && (
        <Card padding="sm">
          <SkeletonRows rows={5} cols={6} />
        </Card>
      )}

      {isError && (
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="Error al cargar clientes"
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={<Icon.Users className="h-6 w-6" />}
          title={customers?.length === 0 ? 'No tienes clientes aún' : 'Sin resultados'}
          description={
            customers?.length === 0
              ? 'Agrega tu primer cliente o espera a que lleguen por vincularlos con su teléfono.'
              : 'Cambia los filtros o la búsqueda.'
          }
          action={
            customers?.length === 0 && (
              <Button
                onClick={() => setShowForm(true)}
                leftIcon={<Icon.Plus className="h-4 w-4" />}
              >
                Agregar primer cliente
              </Button>
            )
          }
        />
      )}

      {/* Mobile: cards apiladas */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-2 md:hidden">
          {filtered.map(c => {
            const cfg = tagConfig[c.autoTag as TagKey]
            const waHref = c.phone
              ? waLink(c.phone, c.autoTag === 'INACTIVO'
                  ? waTemplates.reactivation(c.fullName)
                  : waTemplates.generic(c.fullName))
              : null
            return (
              <Card key={c.id} padding="sm" className="active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{c.fullName}</p>
                    {c.phone && (
                      <p className="text-xs text-slate-500 tabular-nums">{c.phone}</p>
                    )}
                  </div>
                  <Badge tone={cfg.tone} size="sm">{cfg.label}</Badge>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                  <div>
                    <p className="text-slate-400">Total gastado</p>
                    <p className="text-base font-bold text-slate-800 tabular-nums">{formatCop(c.totalSpent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">{c.totalPurchases} compras</p>
                    <p className="text-slate-500">
                      {c.lastVisitAt ? `Hace ${c.daysSinceLastVisit}d` : 'Sin visitas'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5 border-t border-slate-100 pt-2">
                  {waHref && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/10 px-2 py-1.5 text-xs font-semibold text-[#25D366]"
                    >
                      <Icon.WhatsApp className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditing(c); setShowForm(true) }}
                    leftIcon={<Icon.Edit className="h-3.5 w-3.5" />}
                    fullWidth
                  >
                    Editar
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Desktop / tablet: tabla */}
      {!isLoading && !isError && filtered.length > 0 && (
        <Card padding="none" className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Etiqueta</th>
                  <th className="px-5 py-3.5 text-center">Compras</th>
                  <th className="px-5 py-3.5">Total gastado</th>
                  <th className="px-5 py-3.5">Última visita</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const cfg = tagConfig[c.autoTag as TagKey]
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{c.fullName}</div>
                        {c.phone && (
                          <div className="text-xs text-slate-400">{c.phone}</div>
                        )}
                        {c.manualTags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.manualTags.map(t => (
                              <span
                                key={t}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={cfg.tone}>{cfg.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-center tabular-nums text-slate-700">
                        {c.totalPurchases}
                      </td>
                      <td className="px-5 py-3 font-medium tabular-nums text-slate-800">
                        {formatCop(c.totalSpent)}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {c.lastVisitAt
                          ? `Hace ${c.daysSinceLastVisit} días`
                          : <span className="text-slate-400">Sin visitas</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          {c.phone && (() => {
                            // Plantilla según etiqueta: reactivación para INACTIVO, genérico para el resto
                            const template = c.autoTag === 'INACTIVO'
                              ? waTemplates.reactivation(c.fullName)
                              : waTemplates.generic(c.fullName)
                            const link = waLink(c.phone, template)
                            if (!link) return null
                            return (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Escribir por WhatsApp"
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/10 transition"
                              >
                                <Icon.WhatsApp className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            )
                          })()}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditing(c); setShowForm(true) }}
                            leftIcon={<Icon.Edit className="h-3.5 w-3.5" />}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(c)}
                            leftIcon={<Icon.Trash className="h-3.5 w-3.5" />}
                            className="hover:bg-danger-50 hover:text-danger-600"
                          >
                            Quitar
                          </Button>
                        </div>
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
