import { useState } from 'react'
import { useProducts } from '@/hooks/use-products'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'
import type { CartItem, CreateSaleRequest, SaleResponse } from '@/types/sale'

const paymentMethods = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' }
]

export default function PosPage() {
  const { data: products, isLoading } = useProducts()
  const qc = useQueryClient()

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
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
    }
  })

  // Filtrar productos: favoritos primero, luego por búsqueda
  const favorites = products?.filter(p => p.favorite) ?? []
  const filtered = search
    ? products?.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      ) ?? []
    : favorites

  const addToCart = (product: Product) => {
    setLastSale(null)
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        taxRate: product.taxRate,
        quantity: 1
      }]
    })
  }

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId))
    } else {
      setCart(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ))
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartTax = cart.reduce((sum, i) => sum + (i.price * i.quantity * i.taxRate / 100), 0)
  const cartTotal = cartSubtotal + cartTax

  const handleCobrar = () => {
    if (cart.length === 0) return
    createSale.mutate({
      paymentMethod: payment,
      customerPhone: customerPhone || undefined,
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
    })
  }

  const formatCop = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  if (isLoading) return <div className="p-6 text-slate-500">Cargando POS...</div>

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* ── Panel izquierdo: Productos ─────────────────────── */}
      <div className="flex-1 overflow-y-auto border-r border-slate-200 bg-white p-4">
        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar producto o escanear código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            {search ? 'No se encontró ese producto' : 'Marca productos como favoritos para verlos aquí'}
          </div>
        )}

        {/* Grid de productos (botones grandes, touch-friendly) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition active:scale-95 ${
                p.stock <= 0
                  ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
              }`}
              style={{ minHeight: '120px' }}
            >
              <span className="text-sm font-semibold text-slate-800 leading-tight">{p.name}</span>
              <span className="mt-1 text-lg font-bold text-blue-600">{formatCop(p.price)}</span>
              <span className={`mt-1 text-xs ${p.lowStock ? 'text-red-500' : 'text-slate-400'}`}>
                {p.stock} en stock
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: Carrito ────────────────────────── */}
      <div className="w-96 flex flex-col bg-slate-50">
        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Carrito ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              Toca un producto para agregarlo
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="rounded-lg bg-white border border-slate-200 p-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-300 hover:text-red-500 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCop(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales + pago + cobrar */}
        <div className="border-t border-slate-200 bg-white p-4 space-y-3">
          {/* Vincular cliente por teléfono */}
          <input
            type="text"
            placeholder="Teléfono del cliente (opcional)"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Método de pago */}
          <div className="flex gap-1.5 flex-wrap">
            {paymentMethods.map(pm => (
              <button
                key={pm.value}
                onClick={() => setPayment(pm.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  payment === pm.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pm.label}
              </button>
            ))}
          </div>

          {/* Totales */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCop(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA</span>
              <span>{formatCop(cartTax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-1 border-t border-slate-100">
              <span>Total</span>
              <span>{formatCop(cartTotal)}</span>
            </div>
          </div>

          {/* Botón COBRAR (RF-05: gigante y siempre visible) */}
          <button
            onClick={handleCobrar}
            disabled={cart.length === 0 || createSale.isPending}
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
          >
            {createSale.isPending ? 'Procesando...' : `COBRAR ${formatCop(cartTotal)}`}
          </button>

          {/* Venta exitosa */}
          {lastSale && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
              <p className="text-sm font-semibold text-green-800">Venta registrada</p>
              <p className="text-xs text-green-600 mt-1">
                {formatCop(lastSale.total)} — {lastSale.paymentMethod}
              </p>
            </div>
          )}

          {/* Error */}
          {createSale.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">Error al registrar la venta. Verifica el stock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
