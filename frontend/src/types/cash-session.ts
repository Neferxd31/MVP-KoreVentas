export interface CashSession {
  id: string
  openedBy: string
  openedAt: string
  closedAt: string | null
  openingAmount: number
  countedAmount: number | null
  expectedAmount: number | null
  difference: number | null
  status: 'ABIERTA' | 'CERRADA'
  notes: string | null
  // Solo para sesión abierta — calculado en backend en tiempo real
  currentExpected: number | null
  cashSalesSoFar: number | null
}

export interface OpenCashSessionRequest {
  openingAmount: number
}

export interface CloseCashSessionRequest {
  countedAmount: number
  notes?: string
}
