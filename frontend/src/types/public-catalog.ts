export interface PublicCatalogItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
}

export interface PublicCatalog {
  businessName: string
  logoUrl: string | null
  primaryColor: string
  customColor: string | null
  whatsappPhone: string | null
  items: PublicCatalogItem[]
  itemCount: number
}
