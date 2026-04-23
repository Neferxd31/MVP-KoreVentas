import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Service, CreateServiceRequest } from '@/types/service'

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => (await api.get<Service[]>('/services')).data
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateServiceRequest) =>
      (await api.post<Service>('/services', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] })
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateServiceRequest }) =>
      (await api.patch<Service>(`/services/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] })
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/services/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] })
  })
}
