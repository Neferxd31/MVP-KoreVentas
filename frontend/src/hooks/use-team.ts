import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Account,
  InviteMemberRequest,
  InviteResponse,
  UpdateMemberRequest
} from '@/types/account'

export function useTeam() {
  return useQuery<Account[]>({
    queryKey: ['team'],
    queryFn: async () => (await api.get<Account[]>('/team')).data
  })
}

export function useInviteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: InviteMemberRequest) =>
      (await api.post<InviteResponse>('/team/invite', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] })
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMemberRequest }) =>
      (await api.patch<Account>(`/team/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] })
  })
}

export function useDeactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/team/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] })
  })
}
