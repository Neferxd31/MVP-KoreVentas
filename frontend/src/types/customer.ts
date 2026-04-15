export interface Customer {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  notes: string | null
  birthday: string | null
  autoTag: 'NUEVO' | 'FRECUENTE' | 'VIP' | 'INACTIVO'
  manualTags: string[]
  totalPurchases: number
  totalSpent: number
  avgTicket: number
  lastVisitAt: string | null
  daysSinceLastVisit: number
  avgDaysBetweenVisits: number | null
  createdAt: string
}

export interface CreateCustomerRequest {
  fullName: string
  phone?: string
  email?: string
  notes?: string
  birthday?: string
  manualTags?: string[]
}

export interface UpdateCustomerRequest {
  fullName?: string
  phone?: string
  email?: string
  notes?: string
  birthday?: string
  manualTags?: string[]
}
