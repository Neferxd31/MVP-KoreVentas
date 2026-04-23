import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        placeholder="Ej: Coca-Cola 400ml"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Opcional"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio *"
          type="number"
          min="0"
          step="100"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          placeholder="0"
        />
        <Input
          label="Costo"
          type="number"
          min="0"
          step="100"
          value={cost}
          onChange={e => setCost(e.target.value)}
          hint="Para calcular margen"
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">IVA %</label>
          <select
            value={taxRate}
            onChange={e => setTaxRate(e.target.value)}
            className="h-[38px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="19">19%</option>
            <option value="5">5%</option>
            <option value="0">0% (Excluido)</option>
          </select>
        </div>
        <Input
          label="Stock"
          type="number"
          min="0"
          value={stock}
          onChange={e => setStock(e.target.value)}
        />
        <Input
          label="Alerta stock"
          type="number"
          min="0"
          value={stockAlert}
          onChange={e => setStockAlert(e.target.value)}
        />
      </div>

      <Input
        label="Código de barras"
        value={barcode}
        onChange={e => setBarcode(e.target.value)}
        placeholder="Opcional"
      />

      <label className={cn(
        'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
        favorite ? 'border-brand-400 bg-brand-50/60' : 'border-slate-200 hover:border-slate-300'
      )}>
        <input
          type="checkbox"
          checked={favorite}
          onChange={e => setFavorite(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <div>
          <span className="text-sm font-medium text-slate-700">Marcar como favorito</span>
          <p className="text-xs text-slate-500">Aparecerá fijo en el POS para venta rápida.</p>
        </div>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} fullWidth>
          {initial ? 'Actualizar' : 'Crear producto'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
