import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '@/components/ui/icons'
import { applyPalette, paletteFromHex, PALETTES } from '@/lib/theme'
import { cn, formatCop } from '@/lib/utils'
import { waLink } from '@/lib/whatsapp'
import { usePublicCatalog } from '@/hooks/use-public-catalog'
import type { PublicCatalogItem } from '@/types/public-catalog'

interface CartLine {
  product: PublicCatalogItem
  quantity: number
}

export default function PublicCatalogPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: catalog, isLoading, isError } = usePublicCatalog(slug ?? null)

  const [cart, setCart] = useState<Map<string, CartLine>>(new Map())
  const [search, setSearch] = useState('')

  // Aplicar la paleta del negocio al cargar
  useEffect(() => {
    if (!catalog) return
    if (catalog.primaryColor === 'custom' && catalog.customColor) {
      applyPalette('custom', catalog.customColor)
    } else if (catalog.primaryColor !== 'custom') {
      const key = catalog.primaryColor as keyof typeof PALETTES
      if (PALETTES[key]) applyPalette(key, null)
    }
  }, [catalog?.primaryColor, catalog?.customColor])

  const total = useMemo(() => {
    let sum = 0
    cart.forEach(line => { sum += Number(line.product.price) * line.quantity })
    return sum
  }, [cart])

  const itemsInCart = useMemo(() => {
    let count = 0
    cart.forEach(l => { count += l.quantity })
    return count
  }, [cart])

  const filtered = useMemo(() => {
    if (!catalog?.items) return []
    if (!search.trim()) return catalog.items
    const q = search.toLowerCase()
    return catalog.items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    )
  }, [catalog?.items, search])

  const incQty = (p: PublicCatalogItem) => {
    setCart(prev => {
      const next = new Map(prev)
      const line = next.get(p.id)
      const newQty = (line?.quantity ?? 0) + 1
      if (newQty > p.stock) return prev
      next.set(p.id, { product: p, quantity: newQty })
      return next
    })
  }

  const decQty = (id: string) => {
    setCart(prev => {
      const next = new Map(prev)
      const line = next.get(id)
      if (!line) return prev
      if (line.quantity <= 1) next.delete(id)
      else next.set(id, { ...line, quantity: line.quantity - 1 })
      return next
    })
  }

  const buildOrderMessage = (): string => {
    const businessName = catalog?.businessName ?? 'el negocio'
    const lines: string[] = [`*Pedido para ${businessName}*`, '']
    cart.forEach(line => {
      const subtotal = Number(line.product.price) * line.quantity
      lines.push(`• ${line.quantity} × ${line.product.name} — ${formatCop(subtotal)}`)
    })
    lines.push('')
    lines.push(`*Total estimado: ${formatCop(total)}*`)
    lines.push('')
    lines.push('¿Cómo proceder con el pedido?')
    return lines.join('\n')
  }

  const handleSendOrder = () => {
    if (!catalog?.whatsappPhone) {
      alert('Este negocio aún no configuró WhatsApp para recibir pedidos.')
      return
    }
    if (cart.size === 0) return
    const link = waLink(catalog.whatsappPhone, buildOrderMessage())
    if (link) window.open(link, '_blank')
  }

  // Estados de carga / error
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  if (isError || !catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon.AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Catálogo no disponible</h1>
          <p className="mt-1 text-sm text-slate-500">
            El enlace que abriste no existe o el negocio desactivó su catálogo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header del negocio */}
      <header className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-4">
            {catalog.logoUrl ? (
              <img
                src={catalog.logoUrl}
                alt={catalog.businessName}
                className="h-16 w-16 flex-shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-soft-lg"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold backdrop-blur">
                {catalog.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-white/70">Catálogo</p>
              <h1 className="text-2xl font-bold truncate sm:text-3xl">{catalog.businessName}</h1>
              <p className="mt-0.5 text-sm text-white/80">
                {catalog.itemCount} {catalog.itemCount === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Buscador */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon.Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Grid de productos */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:px-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Icon.Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {search ? 'No encontramos productos con esa búsqueda.' : 'Este catálogo está vacío.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(p => {
              const line = cart.get(p.id)
              const qty = line?.quantity ?? 0
              const atMax = qty >= p.stock
              return (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-soft-md"
                >
                  {p.imageUrl ? (
                    <div className="aspect-square w-full overflow-hidden bg-slate-100">
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <Icon.Package className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-2 text-sm">{p.name}</p>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{p.description}</p>
                      )}
                    </div>
                    <p className="mt-auto text-base font-bold text-brand-700 tabular-nums">
                      {formatCop(p.price)}
                    </p>
                    {/* Selector cantidad */}
                    {qty > 0 ? (
                      <div className="flex items-center justify-between rounded-lg bg-brand-50 p-1.5">
                        <button
                          onClick={() => decQty(p.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-brand-700 shadow-soft hover:bg-brand-50 active:scale-95"
                          aria-label="Disminuir"
                        >
                          <Icon.Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-bold tabular-nums text-brand-700">{qty}</span>
                        <button
                          onClick={() => incQty(p)}
                          disabled={atMax}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-brand-700 shadow-soft hover:bg-brand-50 active:scale-95 disabled:opacity-40"
                          aria-label="Aumentar"
                        >
                          <Icon.Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => incQty(p)}
                        className="rounded-lg bg-brand-600 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Barra inferior fija con resumen + botón pedir */}
      {cart.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-soft-lg backdrop-blur pb-[env(safe-area-inset-bottom)] animate-slide-in-up">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">
                {itemsInCart} {itemsInCart === 1 ? 'producto' : 'productos'} en tu pedido
              </p>
              <p className="text-lg font-bold tabular-nums text-slate-900">{formatCop(total)}</p>
            </div>
            <button
              onClick={handleSendOrder}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-soft-lg transition hover:bg-[#1ebe5a] active:scale-[0.98]',
                !catalog.whatsappPhone && 'opacity-50 cursor-not-allowed'
              )}
              disabled={!catalog.whatsappPhone}
            >
              <Icon.WhatsApp className="h-5 w-5" />
              Pedir por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Marca de agua */}
      <div className="mx-auto max-w-5xl px-4 pb-24 text-center sm:px-6">
        <p className="text-[11px] tracking-wider text-slate-400">
          Hecho con <span className="font-semibold text-slate-500">KoreVentas</span>
        </p>
      </div>
    </div>
  )
}

// Re-exporta paletteFromHex para evitar warnings de unused; lo usa applyPalette internamente
void paletteFromHex
