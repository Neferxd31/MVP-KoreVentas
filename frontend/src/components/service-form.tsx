import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import type { Service, CreateServiceRequest } from '@/types/service'

interface Props {
  initial?: Service
  onSubmit: (data: CreateServiceRequest) => void
  onCancel: () => void
  loading?: boolean
}

const presetColors = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'
]

export default function ServiceForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 30)
  const [price, setPrice] = useState(initial?.price ?? 0)
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 0)
  const [color, setColor] = useState(initial?.color ?? '#6366f1')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      durationMinutes,
      price,
      taxRate,
      color
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        placeholder="Ej: Corte clásico, Manicure, Asesoría..."
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Qué incluye el servicio..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Duración (min) *"
          type="number"
          min={1}
          value={durationMinutes}
          onChange={e => setDurationMinutes(Number(e.target.value))}
          required
        />
        <Input
          label="Precio *"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          required
          hint="COP"
        />
        <Input
          label="IVA (%)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={taxRate}
          onChange={e => setTaxRate(Number(e.target.value))}
          hint="0, 5 o 19"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Color en el calendario</label>
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
          {initial ? 'Actualizar' : 'Crear servicio'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
