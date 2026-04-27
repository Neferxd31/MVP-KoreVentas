import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer'

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => (await api.get<Customer[]>('/customers')).data
  })
}

export function useInactiveCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers', 'inactive'],
    queryFn: async () => (await api.get<Customer[]>('/customers/inactive')).data
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCustomerRequest) =>
      (await api.post<Customer>('/customers', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] })
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      (await api.patch<Customer>(`/customers/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] })
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/customers/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] })
  })
}

/**
 * Busca un cliente por teléfono. Devuelve null si no existe (404).
 * Útil para detección proactiva al escribir el teléfono en POS.
 */
export function useCustomerByPhone(phone: string | null) {
  const cleaned = phone?.replace(/\s/g, '') ?? ''
  return useQuery<Customer | null>({
    enabled: cleaned.length >= 7,
    queryKey: ['customers', 'by-phone', cleaned],
    queryFn: async () => {
      try {
        const res = await api.get<Customer>(`/customers/phone/${encodeURIComponent(cleaned)}`)
        return res.data
      } catch (e: any) {
        if (e?.response?.status === 404) return null
        throw e
      }
    },
    // Sin reintentos en 404s
    retry: false
  })
}

/** Asigna un cliente a una venta existente. */
export function useAssignSaleCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ saleId, customerId }: { saleId: string; customerId: string }) =>
      (await api.patch(`/sales/${saleId}/customer`, { customerId })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}
