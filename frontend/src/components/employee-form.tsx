import { useState } from 'react'
import { Button, Input, Icon } from '@/components/ui'
import type { Employee, CreateEmployeeRequest } from '@/types/employee'

interface Props {
  initial?: Employee
  onSubmit: (data: CreateEmployeeRequest) => void
  onCancel: () => void
  loading?: boolean
}

const presetColors = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'
]

export default function EmployeeForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [color, setColor] = useState(initial?.color ?? '#64748b')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      fullName,
      role: role || undefined,
      phone: phone || undefined,
      color
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo *"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        required
        placeholder="Ej: Ana Rodríguez"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Rol / Cargo"
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="Ej: Estilista, Barbero, Asesor..."
        />
        <Input
          label="Teléfono"
          leftIcon={<Icon.Phone className="h-4 w-4" />}
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="3001234567"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Color identificador</label>
        <div className="flex flex-wrap gap-2">
          {presetColors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                color === c ? 'border-slate-800 scale-110' : 'border-white shadow-soft'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} fullWidth>
          {initial ? 'Actualizar' : 'Agregar al equipo'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
