export interface Service {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  taxRate: number
  color: string
  active: boolean
}

export interface CreateServiceRequest {
  name: string
  description?: string
  durationMinutes: number
  price: number
  taxRate?: number
  color?: string
}
