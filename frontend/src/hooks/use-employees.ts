import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Employee, CreateEmployeeRequest } from '@/types/employee'

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => (await api.get<Employee[]>('/employees')).data
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEmployeeRequest) =>
      (await api.post<Employee>('/employees', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] })
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateEmployeeRequest }) =>
      (await api.patch<Employee>(`/employees/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] })
  })
}

export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/employees/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] })
  })
}
