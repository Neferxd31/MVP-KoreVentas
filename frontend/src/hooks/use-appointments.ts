import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest
} from '@/types/appointment'

export function useAppointments(from: string, to: string) {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', from, to],
    queryFn: async () =>
      (await api.get<Appointment[]>('/appointments', { params: { from, to } })).data,
    enabled: !!from && !!to
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) =>
      (await api.post<Appointment>('/appointments', data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-pulso'] })
    }
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppointmentStatusRequest }) =>
      (await api.patch<Appointment>(`/appointments/${id}/status`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-pulso'] })
    }
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/appointments/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] })
  })
}
