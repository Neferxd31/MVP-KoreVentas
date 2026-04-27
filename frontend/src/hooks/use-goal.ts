import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { GoalProgress, UpsertGoalRequest } from '@/types/goal'

export function useCurrentGoal() {
  return useQuery<GoalProgress>({
    queryKey: ['goal', 'current'],
    queryFn: async () => (await api.get<GoalProgress>('/goals/current')).data
  })
}

export function useUpsertGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpsertGoalRequest) =>
      (await api.put<GoalProgress>('/goals', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goal'] })
  })
}
