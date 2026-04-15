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
