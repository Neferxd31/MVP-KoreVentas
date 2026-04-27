export interface GoalProgress {
  year: number
  month: number
  revenueTarget: number
  ordersTarget: number
  revenueSoFar: number
  ordersSoFar: number
  dayOfMonth: number
  daysInMonth: number
  projectedRevenue: number
  goalSet: boolean
}

export interface UpsertGoalRequest {
  year: number
  month: number
  revenueTarget: number
  ordersTarget: number
}
