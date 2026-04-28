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
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-products'
import { useIsAdmin } from '@/hooks/use-account'
import ProductForm from '@/components/product-form'
import { cn, formatCop } from '@/lib/utils'
import type { Product, CreateProductRequest } from '@/types/product'

export default function ProductsPage() {
  const toast = useToast()
  const isAdmin = useIsAdmin()
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
      onSuccess: () => {
        toast.success('Producto creado', data.name)
        setShowForm(false)
      },
      onError: () => toast.error('No se pudo crear el producto')
    })
  }

  const handleUpdate = (data: CreateProductRequest) => {
    if (!editing) return
    updateProduct.mutate({ id: editing.id, data }, {
      onSuccess: () => {
        toast.success('Producto actualizado')
        setEditing(null)
        setShowForm(false)
      },
      onError: () => toast.error('No se pudo actualizar')
    })
  }

  const handleDelete = (product: Product) => {
    if (!confirm(`¿Desactivar "${product.name}"?`)) return
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success('Producto desactivado'),
      onError: () => toast.error('No se pudo desactivar')
    })
  }

  const lowStockCount = products?.filter(p => p.lowStock).length ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl transition-colors">
            Productos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {products?.length ?? 0} productos activos
            {lowStockCount > 0 && (
              <>
                {' · '}
                <span className="font-medium text-danger-600 dark:text-danger-400">
                  {lowStockCount} con stock bajo
                </span>
              </>
            )}
          </p>
        </div>
        {!showForm && isAdmin && (
          <Button
            onClick={() => { setEditing(null); setShowForm(true) }}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Nuevo producto
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6 animate-fade-in dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white transition-colors">
            {editing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <ProductForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setEditing(null); setShowForm(false) }}
            loading={createProduct.isPending || updateProduct.isPending}
          />
        </Card>
      )}

      {/* Búsqueda */}
      <div className="mb-4">
        <Input
          leftIcon={<Icon.Search className="h-4 w-4" />}
          placeholder="Buscar por nombre o código de barras..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      {isLoading && (
        <Card padding="sm" className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <SkeletonRows rows={5} cols={5} />
        </Card>
      )}

      {isError && (
        <EmptyState
          icon={<Icon.AlertTriangle className="h-6 w-6" />}
          title="Error al cargar productos"
          description="¿El backend está corriendo?"
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={<Icon.Package className="h-6 w-6" />}
          title={products?.length === 0 ? 'No tienes productos aún' : 'Sin resultados'}
          description={
            products?.length === 0
              ? 'Crea tu primer producto para empezar a vender.'
              : 'Intenta con otra búsqueda.'
          }
          action={
            products?.length === 0 && isAdmin && (
              <Button
                onClick={() => setShowForm(true)}
                leftIcon={<Icon.Plus className="h-4 w-4" />}
              >
                Crear primer producto
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <Card padding="none" className="overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 transition-colors">
                <tr>
                  <th className="px-5 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Precio</th>
                  {isAdmin && <th className="px-5 py-3.5">Margen</th>}
                  <th className="px-5 py-3.5">IVA</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                  <th className="px-5 py-3.5 text-center">Favorito</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                {filtered.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb url={p.imageUrl} name={p.name} />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 dark:text-slate-200 transition-colors">{p.name}</div>
                          {p.barcode && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{p.barcode}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-white tabular-nums transition-colors">
                      {formatCop(p.price)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        {p.cost && Number(p.cost) > 0 ? (() => {
                          const margin = ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100
                          const tone: 'success' | 'warning' | 'danger' =
                            margin >= 30 ? 'success' : margin >= 15 ? 'warning' : 'danger'
                          return (
                            <Badge tone={tone} size="sm">
                              {margin.toFixed(0)}%
                            </Badge>
                          )
                        })() : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors">Sin costo</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 transition-colors">{p.taxRate}%</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={p.lowStock ? 'danger' : 'success'} size="sm">
                        {p.stock}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {p.favorite ? (
                        <Icon.Star className="mx-auto h-4 w-4 fill-warning-500 text-warning-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 transition-colors">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditing(p); setShowForm(true) }}
                            leftIcon={<Icon.Edit className="h-3.5 w-3.5" />}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(p)}
                            leftIcon={<Icon.Trash className="h-3.5 w-3.5" />}
                            className="hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-400"
                          >
                            Quitar
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// Miniatura cuadrada del producto. Si no hay imagen muestra placeholder con la inicial.
function ProductThumb({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 transition-colors">
        <img src={url} alt={name} className="h-full w-full object-cover" />
      </div>
    )
  }
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500 transition-colors">
      {initial}
    </div>
  )
}