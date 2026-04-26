import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Settings, UpdateSettingsRequest } from '@/types/settings'

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<Settings>('/settings')).data,
    // Las settings cambian poco — cache amplia
    staleTime: 60_000
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) =>
      (await api.put<Settings>('/settings', data)).data,
    onSuccess: data => {
      qc.setQueryData(['settings'], data)
    }
  })
}
