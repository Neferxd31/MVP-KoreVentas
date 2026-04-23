import { useState } from 'react'
import { Button, Input, Icon } from '@/components/ui'
import type { Customer, CreateCustomerRequest } from '@/types/customer'

interface Props {
  initial?: Customer
  onSubmit: (data: CreateCustomerRequest) => void
  onCancel: () => void
  loading?: boolean
}

export default function CustomerForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [birthday, setBirthday] = useState(initial?.birthday ?? '')
  const [tagInput, setTagInput] = useState('')
  const [manualTags, setManualTags] = useState<string[]>(initial?.manualTags ?? [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      fullName,
      phone: phone || undefined,
      email: email || undefined,
      notes: notes || undefined,
      birthday: birthday || undefined,
      manualTags: manualTags.length > 0 ? manualTags : undefined
    })
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !manualTags.includes(tag)) {
      setManualTags([...manualTags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setManualTags(manualTags.filter(t => t !== tag))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre *"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          placeholder="Ej: María Pérez"
        />
        <Input
          label="Teléfono"
          leftIcon={<Icon.Phone className="h-4 w-4" />}
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="3001234567"
          hint="Se usa para vincular ventas automáticamente."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="opcional"
        />
        <Input
          label="Cumpleaños"
          type="date"
          value={birthday}
          onChange={e => setBirthday(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Notas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Preferencias, anécdotas, etc."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Etiquetas manuales</label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Ej: mayorista, referido, prefiere corte..."
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Agregar
          </Button>
        </div>
        {manualTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {manualTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-danger-500 transition"
                  aria-label={`Quitar etiqueta ${tag}`}
                >
                  <Icon.X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} fullWidth>
          {initial ? 'Actualizar' : 'Crear cliente'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
