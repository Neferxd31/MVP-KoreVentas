export type PaletteKey = 'indigo' | 'teal' | 'rose' | 'amber' | 'emerald' | 'slate' | 'custom'

export interface Settings {
  businessName: string
  logoUrl: string | null
  primaryColor: PaletteKey
  customColor: string | null
  businessType: string
}

export interface UpdateSettingsRequest {
  businessName?: string
  logoUrl?: string | null
  primaryColor?: PaletteKey
  customColor?: string | null
}
