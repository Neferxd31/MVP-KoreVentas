import { useState } from 'react'
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

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input className={inputClass} value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Cumpleaños</label>
          <input className={inputClass} type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea className={inputClass} value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notas sobre el cliente..." />
      </div>

      <div>
        <label className={labelClass}>Etiquetas manuales</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Ej: mayorista, referido..."
          />
          <button type="button" onClick={addTag} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200">
            Agregar
          </button>
        </div>
        {manualTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {manualTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear cliente'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}
