export interface Product {
  id: string
  categoryId: string | null
  name: string
  description: string | null
  barcode: string | null
  price: number
  cost: number | null
  taxRate: number
  stock: number
  stockAlert: number
  lowStock: boolean
  imageUrl: string | null
  favorite: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  barcode?: string
  price: number
  cost?: number
  taxRate: number
  stock: number
  stockAlert: number
  imageUrl?: string
  favorite: boolean
  categoryId?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  barcode?: string
  price?: number
  cost?: number
  taxRate?: number
  stock?: number
  stockAlert?: number
  imageUrl?: string
  favorite?: boolean
  active?: boolean
  categoryId?: string
}

export interface Category {
  id: string
  name: string
}
