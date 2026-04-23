export interface ReportsOverview {
  revenue: number
  expenses: number
  netProfit: number
  orderCount: number
  averageTicket: number
}

export interface SalesByDay {
  date: string
  total: number
  count: number
}

export interface TopItem {
  id: string
  name: string
  quantity: number
  total: number
}

export interface TopCustomer {
  id: string
  name: string
  phone: string | null
  orders: number
  total: number
}

export interface PaymentBreakdown {
  method: string
  total: number
  count: number
}

export interface EmployeePerformance {
  id: string
  name: string
  completed: number
  total: number
}

export interface AgendaHeatmapCell {
  dow: number // 0=Domingo (PostgreSQL DOW)
  hour: number
  count: number
}
