import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  useToast
} from '@/components/ui'
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment
} from '@/hooks/use-appointments'
import { useServices } from '@/hooks/use-services'
import AppointmentForm from '@/components/appointment-form'
import { cn, formatCop } from '@/lib/utils'
import { waLink, waTemplates } from '@/lib/whatsapp'
import type { Appointment, AppointmentStatus, CreateAppointmentRequest } from '@/types/appointment'

// ── Helpers de fecha ────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day // semana empieza el lunes
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthNames = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

const statusConfig: Record<AppointmentStatus, { label: string; tone: 'info' | 'success' | 'warning' | 'danger' }> = {
  AGENDADA: { label: 'Agendada', tone: 'info' },
  COMPLETADA: { label: 'Completada', tone: 'success' },
  CANCELADA: { label: 'Cancelada', tone: 'danger' },
  NO_ASISTIO: { label: 'No asistió', tone: 'warning' }
}

// ── Componente principal ────────────────────────────────────

export default function AgendaPage() {
  const toast = useToast()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>()
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

  const weekEnd = addDays(weekStart, 7)

  const { data: appointments, isLoading } = useAppointments(
    weekStart.toISOString(),
    weekEnd.toISOString()
  )
  const { data: services } = useServices()
  const createAppt = useCreateAppointment()
  const updateStatus = useUpdateAppointmentStatus()
  const deleteAppt = useDeleteAppointment()

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const apptsByDay = useMemo(() => {
    const map = new Map<number, Appointment[]>()
    if (!appointments) return map
    for (const appt of appointments) {
      const d = new Date(appt.startAt)
      const key = d.getDate() + d.getMonth() * 100 + d.getFullYear() * 10000
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(appt)
    }
    return map
  }, [appointments])

  const getDayAppts = (d: Date): Appointment[] => {
    const key = d.getDate() + d.getMonth() * 100 + d.getFullYear() * 10000
    return apptsByDay.get(key) ?? []
  }

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6)
    if (weekStart.getMonth() === end.getMonth()) {
      return `${weekStart.getDate()} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
  }, [weekStart])

  const handleCreate = (data: CreateAppointmentRequest) => {
    createAppt.mutate(data, {
      onSuccess: () => { toast.success('Cita agendada'); setShowForm(false); setSelectedSlot(undefined) },
      onError: () => toast.error('No se pudo agendar')
    })
  }

  const handleComplete = (appt: Appointment) => {
    const payment = prompt('Método de pago (EFECTIVO, TARJETA, TRANSFERENCIA, NEQUI, DAVIPLATA):', 'EFECTIVO')
    if (!payment) return
    updateStatus.mutate(
      { id: appt.id, data: { status: 'COMPLETADA', paymentMethod: payment.toUpperCase() } },
      {
        onSuccess: () => { toast.success('Cita completada', 'Se generó la venta'); setSelectedAppt(null) },
        onError: () => toast.error('No se pudo completar')
      }
    )
  }

  const handleNoShow = (appt: Appointment) => {
    updateStatus.mutate(
      { id: appt.id, data: { status: 'NO_ASISTIO' } },
      { onSuccess: () => { toast.info('Marcado como no asistió'); setSelectedAppt(null) } }
    )
  }

  const handleCancel = (appt: Appointment) => {
    if (!confirm('¿Cancelar esta cita?')) return
    deleteAppt.mutate(appt.id, {
      onSuccess: () => { toast.success('Cita cancelada'); setSelectedAppt(null) }
    })
  }

  const getServiceColor = (serviceId: string): string => {
    return services?.find(s => s.id === serviceId)?.color ?? '#6366f1'
  }

  const today = new Date()

  const openNewAt = (day: Date) => {
    const now = new Date()
    const base = new Date(day)
    base.setHours(9, 0, 0, 0)
    // Si es hoy, usar la hora actual redondeada a 15min
    if (sameDay(day, now)) {
      base.setHours(now.getHours(), Math.ceil(now.getMinutes() / 15) * 15, 0, 0)
    }
    const iso = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}T${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`
    setSelectedSlot(iso)
    setShowForm(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agenda
          </h1>
          <p className="mt-1 text-sm text-slate-500">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <Icon.ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <Icon.ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => { setSelectedSlot(undefined); setShowForm(true) }}
            leftIcon={<Icon.Plus className="h-4 w-4" />}
          >
            Nueva cita
          </Button>
        </div>
      </div>

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Nueva cita</h2>
              <button
                onClick={() => { setShowForm(false); setSelectedSlot(undefined) }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon.X className="h-5 w-5" />
              </button>
            </div>
            <AppointmentForm
              defaultStartAt={selectedSlot}
              onSubmit={handleCreate}
              onCancel={() => { setShowForm(false); setSelectedSlot(undefined) }}
              loading={createAppt.isPending}
            />
          </Card>
        </div>
      )}

      {/* Modal detalle cita */}
      {selectedAppt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold text-slate-800">
                  {selectedAppt.serviceName}
                </h2>
                <p className="text-sm text-slate-500">
                  {new Date(selectedAppt.startAt).toLocaleString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon.X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 border-y border-slate-100 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <Badge tone={statusConfig[selectedAppt.status].tone}>
                  {statusConfig[selectedAppt.status].label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duración</span>
                <span className="font-medium text-slate-700">{selectedAppt.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Precio</span>
                <span className="font-semibold tabular-nums text-slate-800">{formatCop(selectedAppt.price)}</span>
              </div>
              {selectedAppt.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente</span>
                  <span className="font-medium text-slate-700">{selectedAppt.customerName}</span>
                </div>
              )}
              {selectedAppt.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Teléfono</span>
                  <span className="font-mono text-slate-700">{selectedAppt.customerPhone}</span>
                </div>
              )}
              {selectedAppt.notes && (
                <div>
                  <p className="text-slate-500">Notas</p>
                  <p className="mt-1 text-slate-700">{selectedAppt.notes}</p>
                </div>
              )}
            </div>

            {selectedAppt.customerPhone && (() => {
              const when = new Date(selectedAppt.startAt).toLocaleString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
              })
              const link = waLink(
                selectedAppt.customerPhone,
                waTemplates.appointmentReminder(
                  selectedAppt.customerName ?? 'cliente',
                  selectedAppt.serviceName,
                  when
                )
              )
              if (!link) return null
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1ebe5a] active:scale-[0.98]"
                >
                  <Icon.WhatsApp className="h-4 w-4" />
                  Recordar por WhatsApp
                </a>
              )
            })()}

            {selectedAppt.status === 'AGENDADA' && (
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  fullWidth
                  onClick={() => handleComplete(selectedAppt)}
                  leftIcon={<Icon.Check className="h-4 w-4" />}
                >
                  Completar y facturar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleNoShow(selectedAppt)}
                  >
                    No asistió
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleCancel(selectedAppt)}
                    className="hover:bg-danger-50 hover:text-danger-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Grid semanal */}
      {isLoading ? (
        <Card><p className="text-center text-sm text-slate-500">Cargando agenda...</p></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day, i) => {
            const dayAppts = getDayAppts(day).sort((a, b) =>
              new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
            )
            const isToday = sameDay(day, today)
            return (
              <Card
                key={i}
                padding="sm"
                className={cn(
                  'flex min-h-[200px] flex-col',
                  isToday && 'ring-2 ring-brand-400'
                )}
              >
                <div className="mb-2 flex items-baseline justify-between border-b border-slate-100 pb-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {dayNames[i]}
                    </p>
                    <p className={cn(
                      'text-xl font-bold tabular-nums',
                      isToday ? 'text-brand-600' : 'text-slate-800'
                    )}>
                      {day.getDate()}
                    </p>
                  </div>
                  <button
                    onClick={() => openNewAt(day)}
                    className="rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-brand-600"
                    aria-label="Agregar cita"
                  >
                    <Icon.Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto">
                  {dayAppts.length === 0 && (
                    <p className="mt-6 text-center text-xs text-slate-300">Sin citas</p>
                  )}
                  {dayAppts.map(appt => {
                    const color = getServiceColor(appt.serviceId)
                    const start = new Date(appt.startAt)
                    const hhmm = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
                    const isCancelled = appt.status === 'CANCELADA'
                    const isCompleted = appt.status === 'COMPLETADA'
                    return (
                      <button
                        key={appt.id}
                        onClick={() => setSelectedAppt(appt)}
                        className={cn(
                          'w-full rounded-lg border-l-4 p-2 text-left text-xs transition-all hover:shadow-soft',
                          isCancelled && 'opacity-50 line-through',
                          isCompleted ? 'bg-success-50' : 'bg-slate-50 hover:bg-slate-100'
                        )}
                        style={{ borderLeftColor: color }}
                      >
                        <div className="flex items-center gap-1 font-mono font-semibold text-slate-600">
                          <Icon.Clock className="h-3 w-3" />
                          {hhmm}
                        </div>
                        <p className="mt-0.5 truncate font-medium text-slate-800">
                          {appt.serviceName}
                        </p>
                        {appt.customerName && (
                          <p className="truncate text-slate-500">{appt.customerName}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && appointments?.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<Icon.Calendar className="h-6 w-6" />}
            title="Sin citas esta semana"
            description="Agenda tu primera cita para que aparezca aquí."
            action={
              <Button
                onClick={() => { setSelectedSlot(undefined); setShowForm(true) }}
                leftIcon={<Icon.Plus className="h-4 w-4" />}
              >
                Nueva cita
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
