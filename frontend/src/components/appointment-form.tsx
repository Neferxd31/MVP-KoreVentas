import { useState } from 'react'
import { Button, Input, Icon } from '@/components/ui'
import { useServices } from '@/hooks/use-services'
import { useEmployees } from '@/hooks/use-employees'
import type { CreateAppointmentRequest } from '@/types/appointment'

interface Props {
  defaultStartAt?: string // yyyy-MM-ddTHH:mm
  onSubmit: (data: CreateAppointmentRequest) => void
  onCancel: () => void
  loading?: boolean
}

export default function AppointmentForm({ defaultStartAt, onSubmit, onCancel, loading }: Props) {
  const { data: services } = useServices()
  const { data: employees } = useEmployees()

  const [serviceId, setServiceId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [startAt, setStartAt] = useState(defaultStartAt ?? '')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // startAt viene como "yyyy-MM-ddTHH:mm" local. Lo enviamos como ISO con offset local.
    const local = new Date(startAt)
    onSubmit({
      serviceId,
      employeeId: employeeId || undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      startAt: local.toISOString(),
      notes: notes || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Servicio *</label>
        <select
          value={serviceId}
          onChange={e => setServiceId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Selecciona un servicio</option>
          {services?.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.durationMinutes}min
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Atiende</label>
        <select
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Sin asignar</option>
          {employees?.map(e => (
            <option key={e.id} value={e.id}>{e.fullName}</option>
          ))}
        </select>
      </div>

      <Input
        label="Fecha y hora *"
        type="datetime-local"
        value={startAt}
        onChange={e => setStartAt(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Cliente"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="Nombre"
        />
        <Input
          label="Teléfono"
          leftIcon={<Icon.Phone className="h-4 w-4" />}
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          placeholder="3001234567"
          hint="Vincula al cliente si ya existe."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Notas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Preferencias, observaciones..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} fullWidth>
          Agendar cita
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
