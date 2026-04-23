import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  ReportsOverview,
  SalesByDay,
  TopItem,
  TopCustomer,
  PaymentBreakdown,
  EmployeePerformance,
  AgendaHeatmapCell
} from '@/types/reports'

interface RangeParams {
  from: string
  to: string
}

export function useReportsOverview(params: RangeParams) {
  return useQuery<ReportsOverview>({
    queryKey: ['reports', 'overview', params],
    queryFn: async () => (await api.get<ReportsOverview>('/reports/overview', { params })).data
  })
}

export function useSalesByDay(params: RangeParams) {
  return useQuery<SalesByDay[]>({
    queryKey: ['reports', 'sales-by-day', params],
    queryFn: async () => (await api.get<SalesByDay[]>('/reports/sales-by-day', { params })).data
  })
}

export function useTopProducts(params: RangeParams & { limit?: number }) {
  return useQuery<TopItem[]>({
    queryKey: ['reports', 'top-products', params],
    queryFn: async () => (await api.get<TopItem[]>('/reports/top-products', { params })).data
  })
}

export function useTopServices(params: RangeParams & { limit?: number }) {
  return useQuery<TopItem[]>({
    queryKey: ['reports', 'top-services', params],
    queryFn: async () => (await api.get<TopItem[]>('/reports/top-services', { params })).data
  })
}

export function useTopCustomers(params: RangeParams & { limit?: number }) {
  return useQuery<TopCustomer[]>({
    queryKey: ['reports', 'top-customers', params],
    queryFn: async () => (await api.get<TopCustomer[]>('/reports/top-customers', { params })).data
  })
}

export function usePaymentBreakdown(params: RangeParams) {
  return useQuery<PaymentBreakdown[]>({
    queryKey: ['reports', 'by-payment', params],
    queryFn: async () => (await api.get<PaymentBreakdown[]>('/reports/by-payment', { params })).data
  })
}

export function useEmployeePerformance(params: RangeParams) {
  return useQuery<EmployeePerformance[]>({
    queryKey: ['reports', 'employee-performance', params],
    queryFn: async () =>
      (await api.get<EmployeePerformance[]>('/reports/employee-performance', { params })).data
  })
}

export function useAgendaHeatmap(params: RangeParams) {
  return useQuery<AgendaHeatmapCell[]>({
    queryKey: ['reports', 'agenda-heatmap', params],
    queryFn: async () =>
      (await api.get<AgendaHeatmapCell[]>('/reports/agenda-heatmap', { params })).data
  })
}
