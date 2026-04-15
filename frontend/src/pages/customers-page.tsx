import { useState } from 'react'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/use-customers'
import CustomerForm from '@/components/customer-form'
import type { Customer, CreateCustomerRequest } from '@/types/customer'

const tagColors: Record<string, string> = {
  NUEVO: 'bg-blue-100 text-blue-700',
  FRECUENTE: 'bg-green-100 text-green-700',
  VIP: 'bg-purple-100 text-purple-700',
  INACTIVO: 'bg-red-100 text-red-700'
}

const tagLabels: Record<string, string> = {
  NUEVO: 'Nuevo',
  FRECUENTE: 'Frecuente',
  VIP: 'VIP',
  INACTIVO: 'Inactivo'
}

export default function CustomersPage() {
  const { data: customers, isLoading, isError } = useCustomers()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string>('ALL')

  const filtered = customers?.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase())
      || c.phone?.includes(search)
    const matchesTag = filterTag === 'ALL' || c.autoTag === filterTag
    return matchesSearch && matchesTag
  }) ?? []

  const handleCreate = (data: CreateCustomerRequest) => {
    createCustomer.mutate(data, { onSuccess: () => setShowForm(false) })
  }

  const handleUpdate = (data: CreateCustomerRequest) => {
    if (!editing) return
    updateCustomer.mutate({ id: editing.id, data }, {
      onSuccess: () => { setEditing(null); setShowForm(false) }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este cliente?')) deleteCustomer.mutate(id)
  }

  const handleEdit = (customer: Customer) => {
    setEditing(customer)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
  }

  const formatCop = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const tagCounts = customers?.reduce((acc, c) => {
    acc[c.autoTag] = (acc[c.autoTag] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  if (isLoading) return <div className="p-6 text-slate-500">Cargando clientes...</div>
  if (isError) return <div className="p-6 text-red-600">Error al cargar clientes.</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">{customers?.length ?? 0} clientes registrados</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Nuevo cliente
          </button>
        )}
      </div>

      {/* Resumen de etiquetas */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(['NUEVO', 'FRECUENTE', 'VIP', 'INACTIVO'] as const).map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? 'ALL' : tag)}
            className={`rounded-xl border p-3 text-left transition ${
              filterTag === tag ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tagColors[tag]}`}>
              {tagLabels[tag]}
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-800">{tagCounts[tag] || 0}</p>
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            {editing ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <CustomerForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={createCustomer.isPending || updateCustomer.isPending}
          />
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          {customers?.length === 0
            ? 'No hay clientes aún. ¡Agrega el primero!'
            : 'No se encontraron clientes con esa búsqueda.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3 text-center">Compras</th>
                <th className="px-4 py-3">Total gastado</th>
                <th className="px-4 py-3">Última visita</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{c.fullName}</div>
                    {c.phone && <div className="text-xs text-slate-400">{c.phone}</div>}
                    {c.manualTags.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {c.manualTags.map(t => (
                          <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColors[c.autoTag]}`}>
                      {tagLabels[c.autoTag]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700">{c.totalPurchases}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCop(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.lastVisitAt
                      ? `Hace ${c.daysSinceLastVisit} días`
                      : 'Sin visitas'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerta de inactivos */}
      {tagCounts['INACTIVO'] > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            {tagCounts['INACTIVO']} cliente(s) inactivo(s) — no visitan hace más de 60 días
          </p>
          <p className="text-xs text-red-600 mt-1">
            Estos clientes son candidatos para una campaña de reactivación.
          </p>
        </div>
      )}
    </div>
  )
}
