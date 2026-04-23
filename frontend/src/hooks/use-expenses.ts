import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseRequest,
  ExpenseSummary
} from '@/types/expense'

interface RangeParams {
  from?: string
  to?: string
}

export function useExpenses(params: RangeParams = {}) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', params],
    queryFn: async () => (await api.get<Expense[]>('/expenses', { params })).data
  })
}

export function useExpensesSummary(params: RangeParams = {}) {
  return useQuery<ExpenseSummary>({
    queryKey: ['expenses-summary', params],
    queryFn: async () => (await api.get<ExpenseSummary>('/expenses/summary', { params })).data
  })
}

export function useExpenseCategories() {
  return useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: async () => (await api.get<ExpenseCategory[]>('/expenses/categories')).data
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateExpenseRequest) =>
      (await api.post<Expense>('/expenses', data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-summary'] })
    }
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/expenses/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-summary'] })
    }
  })
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) =>
      (await api.post<ExpenseCategory>('/expenses/categories', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] })
  })
}
