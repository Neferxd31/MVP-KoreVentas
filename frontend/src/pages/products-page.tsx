import { useState } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-products'
import ProductForm from '@/components/product-form'
import type { Product, CreateProductRequest } from '@/types/product'

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  ) ?? []

  const handleCreate = (data: CreateProductRequest) => {
    createProduct.mutate(data, {
      onSuccess: () => setShowForm(false)
    })
  }

  const handleUpdate = (data: CreateProductRequest) => {
    if (!editing) return
    updateProduct.mutate({ id: editing.id, data }, {
      onSuccess: () => { setEditing(null); setShowForm(false) }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Desactivar este producto?')) {
      deleteProduct.mutate(id)
    }
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
  }

  const formatCop = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  if (isLoading) return <div className="p-6 text-slate-500">Cargando productos...</div>
  if (isError) return <div className="p-6 text-red-600">Error al cargar productos. ¿El backend está corriendo?</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500">{products?.length ?? 0} productos activos</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            {editing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <ProductForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={createProduct.isPending || updateProduct.isPending}
          />
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          {products?.length === 0
            ? 'No hay productos aún. ¡Crea el primero!'
            : 'No se encontraron productos con esa búsqueda.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">IVA</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Fav</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    {p.barcode && <div className="text-xs text-slate-400">{p.barcode}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatCop(p.price)}</td>
                  <td className="px-4 py-3 text-slate-500">{p.taxRate}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.lowStock
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.favorite ? '⭐' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerta de stock bajo */}
      {products && products.filter(p => p.lowStock).length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ {products.filter(p => p.lowStock).length} producto(s) con stock bajo
          </p>
          <ul className="mt-1 text-xs text-amber-700">
            {products.filter(p => p.lowStock).map(p => (
              <li key={p.id}>{p.name}: {p.stock} unidades (alerta en {p.stockAlert})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
