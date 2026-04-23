export interface Employee {
  id: string
  fullName: string
  role: string | null
  phone: string | null
  color: string
  active: boolean
}

export interface CreateEmployeeRequest {
  fullName: string
  role?: string
  phone?: string
  color?: string
}
