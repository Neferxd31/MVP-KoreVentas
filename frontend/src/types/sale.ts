export interface CartItem {
  productId: string
  name: string
  price: number
  taxRate: number
  quantity: number
}

export interface CreateSaleRequest {
  paymentMethod: string
  customerId?: string
  customerPhone?: string
  notes?: string
  items: { productId: string; quantity: number }[]
}

export interface SaleResponse {
  id: string
  customerId: string | null
  subtotal: number
  taxTotal: number
  total: number
  paymentMethod: string
  status: string
  notes: string | null
  createdAt: string
  items: SaleItemResponse[]
}

export interface SaleItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
}
