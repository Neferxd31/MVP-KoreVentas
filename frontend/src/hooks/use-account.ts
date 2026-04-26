import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Account,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@/types/account'

export function useMe() {
  return useQuery<Account>({
    queryKey: ['me'],
    queryFn: async () => (await api.get<Account>('/me')).data,
    staleTime: 60_000
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) =>
      (await api.patch<Account>('/me', data)).data,
    onSuccess: data => qc.setQueryData(['me'], data)
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) =>
      (await api.post('/me/password', data)).data
  })
}
