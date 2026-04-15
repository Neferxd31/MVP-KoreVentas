import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Product, CreateProductRequest, UpdateProductRequest, Category } from '@/types/product'

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products')).data
  })
}

export function useLowStockProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'low-stock'],
    queryFn: async () => (await api.get<Product[]>('/products/low-stock')).data
  })
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/products/categories')).data
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProductRequest) =>
      (await api.post<Product>('/products', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      (await api.patch<Product>(`/products/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/products/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) =>
      (await api.post<Category>('/products/categories', { name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })
  })
}
