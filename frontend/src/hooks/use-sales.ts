import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SaleResponse } from '@/types/sale'

export interface SalesSearchParams {
  from?: string
  to?: string
  customerId?: string
  productId?: string
  serviceId?: string
  paymentMethod?: string
}

export function useSearchSales(params: SalesSearchParams) {
  // Filtra params vacíos para no enviar query strings sin valor
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  )
  return useQuery<SaleResponse[]>({
    queryKey: ['sales', 'search', cleaned],
    queryFn: async () => (await api.get<SaleResponse[]>('/sales', { params: cleaned })).data
  })
}

export function useSale(id: string | null) {
  return useQuery<SaleResponse>({
    enabled: !!id,
    queryKey: ['sales', 'detail', id],
    queryFn: async () => (await api.get<SaleResponse>(`/sales/${id}`)).data
  })
}
