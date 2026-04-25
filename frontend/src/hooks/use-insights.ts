import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Insights, ProfitabilityRow } from '@/types/insights'

export function useInsights() {
  return useQuery<Insights>({
    queryKey: ['insights'],
    queryFn: async () => (await api.get<Insights>('/dashboard/insights')).data
  })
}

interface RangeParams {
  from: string
  to: string
  limit?: number
}

export function useProfitability(params: RangeParams) {
  return useQuery<ProfitabilityRow[]>({
    queryKey: ['reports', 'profitability', params],
    queryFn: async () =>
      (await api.get<ProfitabilityRow[]>('/reports/profitability', { params })).data
  })
}
