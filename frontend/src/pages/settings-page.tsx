import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Icon,
  ImageUploader,
  Input,
  SkeletonCard,
  useToast
} from '@/components/ui'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { PALETTE_OPTIONS, applyPalette } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { PaletteKey } from '@/types/settings'

// Genera un slug a partir del nombre del negocio (sin tildes, espacios → guiones)
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function SettingsPage() {
  const toast = useToast()
  const { data: settings, isLoading } = useSettings()
  const update = useUpdateSettings()

  const [businessName, setBusinessName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState<PaletteKey>('indigo')
  const [customColor, setCustomColor] = useState<string>('#6366f1')
  // Catálogo público
  const [catalogEnabled, setCatalogEnabled] = useState(false)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [publicSlug, setPublicSlug] = useState('')

  // Hidratar el form cuando llegan settings
  useEffect(() => {
    if (!settings) return
    setBusinessName(settings.businessName ?? '')
    setLogoUrl(settings.logoUrl)
    setPrimaryColor(settings.primaryColor)
    setCustomColor(settings.customColor ?? '#6366f1')
    setCatalogEnabled(settings.catalogEnabled)
    setWhatsappPhone(settings.whatsappPhone ?? '')
    setPublicSlug(settings.publicSlug ?? '')
  }, [settings])

  // Preview en vivo del color sin guardar todavía
  useEffect(() => {
    applyPalette(primaryColor, primaryColor === 'custom' ? customColor : null)
  }, [primaryColor, customColor])

  const handleSave = () => {
    if (!businessName.trim()) {
      toast.error('El nombre del negocio no puede estar vacío')
      return
    }
    // Validación slug: si el catálogo está activo, slug + whatsapp son obligatorios
    if (catalogEnabled) {
      if (!publicSlug.trim()) {
        toast.error('Define una URL para el catálogo')
        return
      }
      if (!whatsappPhone.trim()) {
        toast.error('Falta el WhatsApp para recibir pedidos')
        return
      }
    }
    update.mutate(
      {
        businessName: businessName.trim(),
        logoUrl,
        primaryColor,
        customColor: primaryColor === 'custom' ? customColor : null,
        catalogEnabled,
        whatsappPhone: whatsappPhone.trim() || null,
        publicSlug: publicSlug.trim() || null
      },
      {
        onSuccess: () => toast.success('Cambios guardados', 'Tu identidad fue actualizada'),
        onError: (e: any) =>
          toast.error('No se pudo guardar', e?.response?.data?.message ?? '')
      }
    )
  }

  const catalogUrl = publicSlug
    ? `${window.location.origin}/c/${publicSlug}`
    : null

  const copyCatalogUrl = () => {
    if (!catalogUrl) return
    navigator.clipboard.writeText(catalogUrl)
    toast.info('Link copiado al portapapeles')
  }

  const shareCatalogUrl = () => {
    if (!catalogUrl) return
    if (navigator.share) {
      navigator.share({
        title: businessName || 'Catálogo',
        text: `Mira mi catálogo de productos: ${businessName}`,
        url: catalogUrl
      }).catch(() => {/* user cancelled */})
    } else {
      copyCatalogUrl()
    }
  }

  const handleReset = () => {
    if (!settings) return
    setBusinessName(settings.businessName ?? '')
    setLogoUrl(settings.logoUrl)
    setPrimaryColor(settings.primaryColor)
    setCustomColor(settings.customColor ?? '#6366f1')
    setCatalogEnabled(settings.catalogEnabled)
    setWhatsappPhone(settings.whatsappPhone ?? '')
    setPublicSlug(settings.publicSlug ?? '')
    applyPalette(settings.primaryColor, settings.customColor)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Personalización
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hazlo tuyo. Tu nombre, tu logo y tus colores aparecerán en toda la aplicación
          y en los recibos que envíes a tus clientes.
        </p>
      </div>

      {isLoading && <SkeletonCard />}

      {settings && (
        <>
          {/* Identidad */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                  <Icon.Building className="h-5 w-5" />
                </div>
              }
              title="Identidad del negocio"
              subtitle="Nombre y logo que verán tus clientes."
            />
            <div className="mt-5 space-y-4">
              <Input
                label="Nombre del negocio"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Ej: Barbería El Capitán"
                hint="Reemplazará a 'KoreVentas' en la barra lateral, recibos y dashboard."
              />
              <ImageUploader
                label="Logo del negocio"
                value={logoUrl}
                onChange={setLogoUrl}
                hint="Aparecerá en la barra lateral y en los recibos. Cuadrado se ve mejor."
              />
            </div>
          </Card>

          {/* Color de marca */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-4 ring-brand-100">
                  <Icon.Sparkles className="h-5 w-5" />
                </div>
              }
              title="Color de marca"
              subtitle="Vista previa en vivo — los cambios se aplican al guardar."
            />
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PALETTE_OPTIONS.map(opt => {
                  const active = primaryColor === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPrimaryColor(opt.key)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 shadow-soft'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <span
                        className="h-6 w-6 flex-shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: opt.swatch }}
                      />
                      <span className={cn(
                        'font-medium',
                        active ? 'text-brand-700' : 'text-slate-700'
                      )}>
                        {opt.label}
                      </span>
                      {active && (
                        <Icon.Check className="ml-auto h-4 w-4 text-brand-600" />
                      )}
                    </button>
                  )
                })}

                {/* Custom */}
                <button
                  type="button"
                  onClick={() => setPrimaryColor('custom')}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all',
                    primaryColor === 'custom'
                      ? 'border-brand-500 bg-brand-50 shadow-soft'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span
                    className="h-6 w-6 flex-shrink-0 rounded-full ring-2 ring-white"
                    style={{
                      background: 'conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #06b6d4, #6366f1, #ec4899, #f43f5e)'
                    }}
                  />
                  <span className={cn(
                    'font-medium',
                    primaryColor === 'custom' ? 'text-brand-700' : 'text-slate-700'
                  )}>
                    Personalizado
                  </span>
                  {primaryColor === 'custom' && (
                    <Icon.Check className="ml-auto h-4 w-4 text-brand-600" />
                  )}
                </button>
              </div>

              {/* Picker de hex cuando se elige custom */}
              {primaryColor === 'custom' && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Color personalizado
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase tabular-nums text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="#6366F1"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Generamos automáticamente toda la escala (50-900) a partir de este color.
                  </p>
                </div>
              )}

              {/* Preview */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vista previa
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Botón primario</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Button size="sm" variant="ghost">Ghost</Button>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    Badge
                  </span>
                  <span className="text-sm text-brand-600">Texto en color de marca</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mini-catálogo público */}
          <Card className="mb-6">
            <CardHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-700 ring-4 ring-success-100">
                  <Icon.WhatsApp className="h-5 w-5" />
                </div>
              }
              title="Mini-catálogo para WhatsApp"
              subtitle="Comparte un link único con tus clientes para que vean tus productos y te envíen pedidos directo a tu WhatsApp."
              action={
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {catalogEnabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <input
                    type="checkbox"
                    checked={catalogEnabled}
                    onChange={e => {
                      setCatalogEnabled(e.target.checked)
                      // Auto-generar slug al activar si no hay uno
                      if (e.target.checked && !publicSlug && businessName) {
                        setPublicSlug(slugify(businessName))
                      }
                    }}
                    className="peer sr-only"
                  />
                  <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 peer-focus:ring-2 peer-focus:ring-brand-400/40">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
              }
            />

            {catalogEnabled && (
              <div className="mt-5 space-y-4">
                <Input
                  label="WhatsApp para recibir pedidos"
                  type="tel"
                  inputMode="tel"
                  placeholder="3001234567"
                  value={whatsappPhone}
                  onChange={e => setWhatsappPhone(e.target.value)}
                  leftIcon={<Icon.Phone className="h-4 w-4" />}
                  hint="Número al que llegará el pedido cuando un cliente compre desde el catálogo."
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    URL pública del catálogo
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                    <span className="flex items-center bg-slate-50 px-3 text-xs text-slate-500 border-r border-slate-200">
                      {window.location.origin}/c/
                    </span>
                    <input
                      type="text"
                      value={publicSlug}
                      onChange={e => setPublicSlug(slugify(e.target.value))}
                      placeholder="mi-negocio"
                      className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none"
                    />
                    {businessName && !publicSlug && (
                      <button
                        type="button"
                        onClick={() => setPublicSlug(slugify(businessName))}
                        className="px-3 text-xs font-semibold text-brand-600 hover:bg-brand-50 border-l border-slate-200"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Solo minúsculas, números y guiones. Debe ser único.
                  </p>
                </div>

                {catalogUrl && settings.publicSlug === publicSlug && settings.catalogEnabled && (
                  <div className="rounded-xl border border-success-200 bg-success-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-success-700">
                      Tu link está activo
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                      {catalogUrl}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon.Receipt className="h-3.5 w-3.5" />}
                        onClick={copyCatalogUrl}
                      >
                        Copiar link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon.WhatsApp className="h-3.5 w-3.5" />}
                        onClick={shareCatalogUrl}
                      >
                        Compartir
                      </Button>
                      <a
                        href={catalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Icon.ChevronRight className="h-3.5 w-3.5" />
                        Ver mi catálogo
                      </a>
                    </div>
                    <p className="mt-3 text-xs text-slate-600">
                      Pega este link en tu estado de WhatsApp, en Instagram o en tus tarjetas
                      de presentación. Cuando alguien lo abra y arme su pedido, lo recibirás
                      en tu WhatsApp con la lista lista para responder.
                    </p>
                  </div>
                )}

                {catalogUrl && (settings.publicSlug !== publicSlug || !settings.catalogEnabled) && (
                  <p className="rounded-lg bg-warning-50 p-3 text-xs text-warning-700">
                    Guarda los cambios para que tu link <span className="font-mono font-semibold">{catalogUrl}</span> quede activo.
                  </p>
                )}
              </div>
            )}

            {!catalogEnabled && (
              <p className="mt-4 text-sm text-slate-500">
                Activa el toggle para crear tu catálogo público. Tus clientes podrán ver tus
                productos sin necesidad de cuenta y enviarte pedidos directo a tu WhatsApp.
              </p>
            )}
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Descartar cambios
            </Button>
            <Button onClick={handleSave} loading={update.isPending}>
              Guardar cambios
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
