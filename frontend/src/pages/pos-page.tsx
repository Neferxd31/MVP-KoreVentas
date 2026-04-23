import { useState } from 'react'
import { useProducts } from '@/hooks/use-products'
import { useServices } from '@/hooks/use-services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Badge, Button, Icon, Input, EmptyState, useToast } from '@/components/ui'
import { cn, formatCop } from '@/lib/utils'
import type { Product } from '@/types/product'
import type { Service } from '@/types/service'
import type { CartItem, CreateSaleRequest, SaleResponse } from '@/types/sale'

const paymentMethods = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
  { value: 'TRANSFERENCIA', label: 'Transfer.' },
  { value: 'TARJETA', label: 'Tarjeta' }
]

type Tab = 'PRODUCTS' | 'SERVICES'

// Clave única de item en el carrito
const itemKey = (i: { itemType: string; productId?: string; serviceId?: string }) =>
  i.itemType === 'PRODUCT' ? `P:${i.productId}` : `S:${i.serviceId}`

export default function PosPage() {
  const toast = useToast()
  const { data: products, isLoading: loadingProducts } = useProducts()
  const { data: services, isLoading: loadingServices } = useServices()
  const qc = useQueryClient()

  const [tab, setTab] = useState<Tab>('PRODUCTS')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payment, setPayment] = useState('EFECTIVO')
  const [customerPhone, setCustomerPhone] = useState('')
  const [search, setSearch] = useState('')
  const [lastSale, setLastSale] = useState<SaleResponse | null>(null)

  const createSale = useMutation({
    mutationFn: async (data: CreateSaleRequest) =>
      (await api.post<SaleResponse>('/sales', data)).data,
    onSuccess: (sale) => {
      setLastSale(sale)
      setCart([])
      setCustomerPhone('')
      toast.success('Venta registrada', `${formatCop(sale.total)} · ${sale.paymentMethod}`)
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['dashboard-pulso'] })
    },
    onError: () => toast.error('No se pudo registrar', 'Revisa stock o conexión.')
  })

  const favorites = products?.filter(p => p.favorite) ?? []
  const filteredProducts = search
    ? products?.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      ) ?? []
    : favorites

  const filteredServices = search
    ? services?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) ?? []
    : services ?? []

  const addProductToCart = (product: Product) => {
    setLastSale(null)
    setCart(prev => {
      const existing = prev.find(i => i.itemType === 'PRODUCT' && i.productId === product.id)
      if (existing) {
        return prev.map(i =>
          i.itemType === 'PRODUCT' && i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        itemType: 'PRODUCT',
        productId: product.id,
        name: product.name,
        price: product.price,
        taxRate: product.taxRate,
        quantity: 1
      }]
    })
  }

  const addServiceToCart = (service: Service) => {
    setLastSale(null)
    setCart(prev => {
      // Servicios: uno por línea, no acumulan cantidad
      if (prev.some(i => i.itemType === 'SERVICE' && i.serviceId === service.id)) {
        toast.info('Ya está en el carrito')
        return prev
      }
      return [...prev, {
        itemType: 'SERVICE',
        serviceId: service.id,
        name: service.name,
        price: service.price,
        taxRate: service.taxRate,
        quantity: 1
      }]
    })
  }

  const updateQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => itemKey(i) !== key))
    } else {
      setCart(prev => prev.map(i =>
        itemKey(i) === key ? { ...i, quantity: qty } : i
      ))
    }
  }

  const removeFromCart = (key: string) =>
    setCart(prev => prev.filter(i => itemKey(i) !== key))

  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const cartTax = cart.reduce((s, i) => s + (i.price * i.quantity * i.taxRate / 100), 0)
  const cartTotal = cartSubtotal + cartTax
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const handleCobrar = () => {
    if (cart.length === 0) return
    createSale.mutate({
      paymentMethod: payment,
      customerPhone: customerPhone || undefined,
      items: cart.map(i =>
        i.itemType === 'PRODUCT'
          ? { productId: i.productId!, quantity: i.quantity }
          : { serviceId: i.serviceId!, quantity: 1 }
      )
    })
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen flex-col lg:flex-row">
      {/* ── Panel izquierdo: Productos / Servicios ─────────── */}
      <div className="flex-1 overflow-y-auto bg-white lg:border-r border-slate-200 p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">Vender</h1>
          <p className="text-xs text-slate-500">Toca un ítem para agregarlo al carrito.</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setTab('PRODUCTS')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              tab === 'PRODUCTS'
                ? 'bg-white text-brand-700 shadow-soft'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon.Package className="h-4 w-4" />
            Productos
          </button>
          <button
            onClick={() => setTab('SERVICES')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              tab === 'SERVICES'
                ? 'bg-white text-brand-700 shadow-soft'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon.Scissors className="h-4 w-4" />
            Servicios
          </button>
        </div>

        <Input
          leftIcon={<Icon.Search className="h-4 w-4" />}
          placeholder={tab === 'PRODUCTS' ? 'Buscar producto o escanear código...' : 'Buscar servicio...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="mb-4"
        />

        {tab === 'PRODUCTS' && (
          <>
            {loadingProducts && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-[120px] rounded-xl" />
                ))}
              </div>
            )}

            {!loadingProducts && filteredProducts.length === 0 && (
              <EmptyState
                icon={<Icon.Package className="h-6 w-6" />}
                title={search ? 'Sin resultados' : 'No hay favoritos aún'}
                description={
                  search
                    ? 'Intenta otra búsqueda o código.'
                    : 'Marca productos como favoritos para verlos aquí siempre.'
                }
              />
            )}

            {!loadingProducts && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map(p => {
                  const out = p.stock <= 0
                  return (
                    <button
                      key={p.id}
                      onClick={() => addProductToCart(p)}
                      disabled={out}
                      className={cn(
                        'group relative flex flex-col items-start justify-between rounded-xl border p-4 text-left transition-all min-h-[128px]',
                        out
                          ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-brand-400 hover:shadow-soft-md hover:-translate-y-0.5 active:scale-[0.98]'
                      )}
                    >
                      {p.favorite && (
                        <Icon.Star className="absolute top-2 right-2 h-3.5 w-3.5 fill-warning-500 text-warning-500" />
                      )}
                      <span className="font-semibold text-slate-800 leading-tight line-clamp-2">
                        {p.name}
                      </span>
                      <div className="w-full">
                        <p className="mt-2 text-lg font-bold text-brand-700 tabular-nums">
                          {formatCop(p.price)}
                        </p>
                        <p className={cn(
                          'mt-0.5 text-xs font-medium',
                          out ? 'text-slate-400' : p.lowStock ? 'text-danger-600' : 'text-slate-400'
                        )}>
                          {out ? 'Sin stock' : `${p.stock} disponibles`}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'SERVICES' && (
          <>
            {loadingServices && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-[120px] rounded-xl" />
                ))}
              </div>
            )}

            {!loadingServices && filteredServices.length === 0 && (
              <EmptyState
                icon={<Icon.Scissors className="h-6 w-6" />}
                title={search ? 'Sin resultados' : 'No hay servicios'}
                description={
                  search
                    ? 'Intenta otra búsqueda.'
                    : 'Ve a "Servicios" para agregar los que ofreces.'
                }
              />
            )}

            {!loadingServices && filteredServices.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredServices.map(s => (
                  <button
                    key={s.id}
                    onClick={() => addServiceToCart(s)}
                    className="group relative flex flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-4 text-left min-h-[128px] transition-all hover:border-brand-400 hover:shadow-soft-md hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <div
                      className="absolute top-2 right-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-semibold text-slate-800 leading-tight line-clamp-2">
                      {s.name}
                    </span>
                    <div className="w-full">
                      <p className="mt-2 text-lg font-bold text-brand-700 tabular-nums">
                        {formatCop(s.price)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-400">
                        <Icon.Clock className="h-3 w-3" />
                        {s.durationMinutes} min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Panel derecho: Carrito ────────────────────────── */}
      <aside className="lg:w-[380px] flex flex-col bg-slate-50 border-t lg:border-t-0 border-slate-200">
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon.Cart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Carrito</p>
                <p className="text-xs text-slate-500">{cartCount} ítem(s)</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs font-medium text-slate-500 hover:text-danger-600 transition"
              >
                Vaciar
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Icon.Cart className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">Carrito vacío</p>
                <p className="text-xs text-slate-400">Toca un ítem para agregarlo</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.map(item => {
                const key = itemKey(item)
                const isService = item.itemType === 'SERVICE'
                return (
                  <li
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white p-3 animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {isService && <Icon.Scissors className="h-3 w-3 text-brand-500" />}
                          <span className="text-sm font-medium text-slate-800 line-clamp-2">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(key)}
                        className="text-slate-300 hover:text-danger-500 transition"
                        aria-label="Quitar"
                      >
                        <Icon.X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {isService ? (
                        <span className="text-xs text-slate-400">Servicio</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          >
                            <Icon.Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          >
                            <Icon.Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">
                        {formatCop(item.price * item.quantity)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Totales + pago */}
        <div className="border-t border-slate-200 bg-white p-4 space-y-3">
          <Input
            leftIcon={<Icon.Phone className="h-4 w-4" />}
            placeholder="Teléfono del cliente (opcional)"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
          />

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Método de pago</p>
            <div className="grid grid-cols-3 gap-1.5">
              {paymentMethods.map(pm => (
                <button
                  key={pm.value}
                  onClick={() => setPayment(pm.value)}
                  className={cn(
                    'rounded-lg px-2 py-2 text-xs font-medium transition-all',
                    payment === pm.value
                      ? 'bg-brand-600 text-white shadow-soft'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCop(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA</span>
              <span className="tabular-nums">{formatCop(cartTax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">{formatCop(cartTotal)}</span>
            </div>
          </div>

          <Button
            onClick={handleCobrar}
            disabled={cart.length === 0}
            loading={createSale.isPending}
            variant="success"
            size="xl"
            fullWidth
          >
            {createSale.isPending ? 'Procesando...' : `COBRAR ${formatCop(cartTotal)}`}
          </Button>

          {lastSale && (
            <div className="flex items-center gap-2.5 rounded-lg bg-success-50 border border-success-200 p-3 animate-fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-600 text-white">
                <Icon.Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success-800">Venta registrada</p>
                <p className="text-xs text-success-700">
                  {formatCop(lastSale.total)} · <Badge tone="success" size="sm">{lastSale.paymentMethod}</Badge>
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
