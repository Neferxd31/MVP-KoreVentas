export interface CartItem {
  productId?: string
  serviceId?: string
  itemType: 'PRODUCT' | 'SERVICE'
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
  items: { productId?: string; serviceId?: string; quantity: number }[]
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
  productId: string | null
  serviceId: string | null
  itemType: 'PRODUCT' | 'SERVICE'
  productName: string
  quantity: number
  unitPrice: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
}
