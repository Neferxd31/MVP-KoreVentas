import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { PublicCatalog } from '@/types/public-catalog'

// Cliente axios SIN auth — el endpoint /public no requiere token
const publicApi = axios.create({
  baseURL: '/api',
  withCredentials: false
})

export function usePublicCatalog(slug: string | null) {
  return useQuery<PublicCatalog>({
    enabled: !!slug,
    queryKey: ['public-catalog', slug],
    queryFn: async () =>
      (await publicApi.get<PublicCatalog>(`/public/catalog/${slug}`)).data,
    retry: false
  })
}
