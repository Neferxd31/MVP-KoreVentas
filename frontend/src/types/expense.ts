export interface ExpenseCategory {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Expense {
  id: string
  categoryId: string | null
  description: string
  amount: number
  paymentMethod: string
  expenseDate: string
  notes: string | null
  createdAt: string
}

export interface CreateExpenseRequest {
  description: string
  amount: number
  categoryId?: string
  paymentMethod?: string
  expenseDate?: string
  notes?: string
}

export interface ExpenseSummary {
  total: number
  byCategory: { categoryId: string | null; categoryName: string; total: number }[]
}
