import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  CashSession,
  OpenCashSessionRequest,
  CloseCashSessionRequest
} from '@/types/cash-session'

export function useCurrentCashSession() {
  return useQuery<CashSession | null>({
    queryKey: ['cash-session', 'current'],
    queryFn: async () => {
      const res = await api.get<CashSession>('/cash-sessions/current', {
        validateStatus: s => s === 200 || s === 204
      })
      if (res.status === 204) return null
      return res.data
    },
    // Refrescar cada 30s para mantener arqueo en vivo
    refetchInterval: 30_000
  })
}

export function useCashSessions() {
  return useQuery<CashSession[]>({
    queryKey: ['cash-session', 'list'],
    queryFn: async () => (await api.get<CashSession[]>('/cash-sessions')).data
  })
}

export function useOpenCashSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: OpenCashSessionRequest) =>
      (await api.post<CashSession>('/cash-sessions/open', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-session'] })
  })
}

export function useCloseCashSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CloseCashSessionRequest }) =>
      (await api.post<CashSession>(`/cash-sessions/${id}/close`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-session'] })
  })
}
