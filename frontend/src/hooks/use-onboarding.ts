import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface OnboardingStatus {
  hasCatalog: boolean
  hasCustomer: boolean
  hasFirstSale: boolean
  hasCashSession: boolean
  hasGoal: boolean
  hasCostsDefined: boolean
  totalSteps: number
  completedSteps: number
  isComplete: boolean
}

export function useOnboarding() {
  return useQuery<OnboardingStatus>({
    queryKey: ['onboarding'],
    queryFn: async () => (await api.get<OnboardingStatus>('/dashboard/onboarding')).data
  })
}
