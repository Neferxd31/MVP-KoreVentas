import { useState } from 'react'
import type { Product, CreateProductRequest } from '@/types/product'

interface Props {
  initial?: Product
  onSubmit: (data: CreateProductRequest) => void
  onCancel: () => void
  loading?: boolean
}

export default function ProductForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [barcode, setBarcode] = useState(initial?.barcode ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '')
  const [taxRate, setTaxRate] = useState(initial?.taxRate?.toString() ?? '19')
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0')
  const [stockAlert, setStockAlert] = useState(initial?.stockAlert?.toString() ?? '5')
  const [favorite, setFavorite] = useState(initial?.favorite ?? false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      barcode: barcode || undefined,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : undefined,
      taxRate: parseFloat(taxRate),
      stock: parseInt(stock),
      stockAlert: parseInt(stockAlert),
      favorite
    })
  }

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nombre *</label>
        <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea className={inputClass} value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio *</label>
          <input className={inputClass} type="number" min="0" step="100" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Costo</label>
          <input className={inputClass} type="number" min="0" step="100" value={cost} onChange={e => setCost(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>IVA %</label>
          <select className={inputClass} value={taxRate} onChange={e => setTaxRate(e.target.value)}>
            <option value="19">19%</option>
            <option value="5">5%</option>
            <option value="0">0% (Excluido)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input className={inputClass} type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Alerta stock</label>
          <input className={inputClass} type="number" min="0" value={stockAlert} onChange={e => setStockAlert(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Código de barras</label>
        <input className={inputClass} value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="favorite" checked={favorite} onChange={e => setFavorite(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        <label htmlFor="favorite" className="text-sm text-slate-700">Marcar como favorito (aparece en POS)</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
