import { useEffect } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { applyPalette } from '@/lib/theme'

/**
 * Componente que sincroniza la paleta del tenant con CSS variables.
 * Se monta una vez tras el login. Al cargar settings (o al cambiarlas)
 * inyecta los colores en :root y todo Tailwind/brand-X queda actualizado.
 */
export function ThemeSync() {
  const { data: settings } = useSettings()

  useEffect(() => {
    if (!settings) return
    applyPalette(settings.primaryColor, settings.customColor)
  }, [settings?.primaryColor, settings?.customColor])

  return null
}
