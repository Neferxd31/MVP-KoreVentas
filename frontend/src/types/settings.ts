export type PaletteKey = 'indigo' | 'teal' | 'rose' | 'amber' | 'emerald' | 'slate' | 'custom'

export interface Settings {
  businessName: string
  logoUrl: string | null
  primaryColor: PaletteKey
  customColor: string | null
  businessType: string
  // Catálogo público
  whatsappPhone: string | null
  publicSlug: string | null
  catalogEnabled: boolean
}

export interface UpdateSettingsRequest {
  businessName?: string
  logoUrl?: string | null
  primaryColor?: PaletteKey
  customColor?: string | null
  whatsappPhone?: string | null
  publicSlug?: string | null
  catalogEnabled?: boolean
}
