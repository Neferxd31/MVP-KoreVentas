import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Icon, Input, useToast, Badge } from '@/components/ui'
import {
  useCustomers,
  useCustomerByPhone,
  useCreateCustomer
} from '@/hooks/use-customers'
import type { Customer } from '@/types/customer'

interface Props {
  value: Customer | null
  onChange: (customer: Customer | null) => void
  placeholder?: string
  /** Si true, también acepta dejar el campo vacío (sin cliente). */
  allowClear?: boolean
}

/**
 * Selector de cliente con autocomplete + creación inline.
 *
 * Comportamiento:
 *   - Al escribir, filtra clientes existentes por nombre o teléfono
 *   - Click en un resultado → lo selecciona (callback onChange)
 *   - Si no hay coincidencias y escribió 7+ dígitos → botón "+ Crear nuevo"
 *   - El mini-modal de crear hace verificación proactiva: si el teléfono
 *     ya existe, muta a "vincular existente" en lugar de crear duplicado
 *   - Al seleccionar muestra chip con [X] para limpiar
 */
export default function CustomerPicker({
  value,
  onChange,
  placeholder = 'Buscar por nombre o teléfono...',
  allowClear = true
}: Props) {
  const { data: allCustomers } = useCustomers()
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ phone: string; name: string }>({
    phone: '', name: ''
  })
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim() || !allCustomers) return []
    const q = query.toLowerCase().trim()
    return allCustomers
      .filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        (c.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ?? false)
      )
      .slice(0, 8)
  }, [query, allCustomers])

  // Detectar si la query es solo dígitos (intención: teléfono)
  const queryAsPhone = query.replace(/\D/g, '')
  const looksLikePhone = queryAsPhone.length >= 7
  const noResults = query.length > 0 && filtered.length === 0

  const handleSelect = (c: Customer) => {
    onChange(c)
    setQuery('')
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
  }

  const handleStartCreate = () => {
    setCreateDefaults({
      phone: looksLikePhone ? queryAsPhone : '',
      name: !looksLikePhone ? query : ''
    })
    setShowDropdown(false)
    setShowCreateModal(true)
  }

  // Caso: ya hay cliente seleccionado → mostrar chip
  if (value) {
    return (
      <div className="rounded-lg border border-success-200 bg-success-50/60 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-success-100 text-success-700">
            <Icon.UserCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{value.fullName}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {value.phone && <span className="tabular-nums">{value.phone}</span>}
              {value.totalPurchases > 0 && (
                <Badge tone={value.autoTag === 'VIP' ? 'purple' : 'success'} size="sm">
                  {value.totalPurchases} compras
                </Badge>
              )}
            </div>
          </div>
          {allowClear && (
            <button
              onClick={handleClear}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
              title="Quitar cliente"
            >
              <Icon.X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <Input
          leftIcon={<Icon.Search className="h-4 w-4" />}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (filtered.length > 0 || noResults) && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-soft-md animate-fade-in">
            {filtered.length > 0 && (
              <ul className="py-1">
                {filtered.map(c => (
                  <li key={c.id}>
                    <button
                      onClick={() => handleSelect(c)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon.Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{c.fullName}</p>
                        {c.phone && (
                          <p className="text-xs text-slate-400 tabular-nums">{c.phone}</p>
                        )}
                      </div>
                      {c.totalPurchases > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {c.totalPurchases} compras
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {noResults && (
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={handleStartCreate}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
                >
                  <Icon.Plus className="h-4 w-4" />
                  <span>
                    Crear nuevo cliente
                    {looksLikePhone && (
                      <span className="ml-1 text-slate-500">({queryAsPhone})</span>
                    )}
                    {!looksLikePhone && query.length > 0 && (
                      <span className="ml-1 text-slate-500">"{query}"</span>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <NewCustomerInline
          defaultPhone={createDefaults.phone}
          defaultName={createDefaults.name}
          onCancel={() => setShowCreateModal(false)}
          onCustomerReady={c => {
            onChange(c)
            setQuery('')
            setShowCreateModal(false)
          }}
        />
      )}
    </>
  )
}

/**
 * Mini-modal de creación con detección proactiva.
 * Si el teléfono ya existe, en lugar de crear vincula al cliente existente.
 */
function NewCustomerInline({
  defaultPhone,
  defaultName,
  onCancel,
  onCustomerReady
}: {
  defaultPhone: string
  defaultName: string
  onCancel: () => void
  onCustomerReady: (c: Customer) => void
}) {
  const toast = useToast()
  const [phone, setPhone] = useState(defaultPhone)
  const [name, setName] = useState(defaultName)
  const createCustomer = useCreateCustomer()

  // Detección proactiva: cada vez que cambia el phone, consultamos
  const cleaned = phone.replace(/\D/g, '')
  const { data: existing, isFetching } = useCustomerByPhone(cleaned.length >= 7 ? cleaned : null)

  const phoneIsRegistered = !!existing

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneIsRegistered && existing) {
      // Vincular sin crear duplicado
      onCustomerReady(existing)
      return
    }
    if (!name.trim()) {
      toast.error('Nombre requerido')
      return
    }
    if (!cleaned || cleaned.length < 7) {
      toast.error('Teléfono inválido')
      return
    }
    createCustomer.mutate(
      { fullName: name.trim(), phone: cleaned },
      {
        onSuccess: c => {
          toast.success('Cliente creado', c.fullName)
          onCustomerReady(c)
        },
        onError: () => toast.error('No se pudo crear el cliente')
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            {phoneIsRegistered ? 'Cliente ya registrado' : 'Nuevo cliente'}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon.X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Teléfono *"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="3001234567"
            leftIcon={<Icon.Phone className="h-4 w-4" />}
            autoFocus={!defaultPhone}
            hint={
              isFetching
                ? 'Verificando...'
                : phoneIsRegistered
                  ? undefined
                  : cleaned.length >= 7
                    ? '✓ Teléfono nuevo, te pediré el nombre'
                    : 'Mínimo 7 dígitos'
            }
          />

          {/* Estado: ya existe → mostramos a quién pertenece */}
          {phoneIsRegistered && existing && (
            <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Icon.UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
                    Ya está registrado
                  </p>
                  <p className="truncate font-bold text-slate-800">{existing.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {existing.totalPurchases} compras · {existing.autoTag}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado: teléfono nuevo → pedimos nombre */}
          {!phoneIsRegistered && cleaned.length >= 7 && (
            <Input
              label="Nombre *"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              autoFocus
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createCustomer.isPending}
              disabled={cleaned.length < 7 || (!phoneIsRegistered && !name.trim())}
            >
              {phoneIsRegistered
                ? `Vincular a ${existing!.fullName.split(' ')[0]}`
                : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
