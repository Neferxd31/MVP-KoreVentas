export type AppointmentStatus = 'AGENDADA' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'

export interface Appointment {
  id: string
  serviceId: string
  serviceName: string
  employeeId: string | null
  customerId: string | null
  customerName: string | null
  customerPhone: string | null
  startAt: string
  endAt: string
  durationMinutes: number
  price: number
  status: AppointmentStatus
  notes: string | null
  saleId: string | null
}

export interface CreateAppointmentRequest {
  serviceId: string
  employeeId?: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  startAt: string
  notes?: string
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus
  paymentMethod?: string
}
