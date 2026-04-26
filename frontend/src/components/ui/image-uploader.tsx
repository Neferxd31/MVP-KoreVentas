import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icons'
import { uploadImage } from '@/lib/image-upload'

interface Props {
  /** URL actual (data URL o https). null/'' = sin imagen */
  value: string | null | undefined
  onChange: (newUrl: string | null) => void
  label?: string
  hint?: string
  /** Tamaño del preview cuadrado, en clases tailwind. Default: h-32 w-32 */
  sizeClass?: string
}

/**
 * Subida de imagen con drag & drop + click + preview.
 * El procesamiento real se delega a uploadImage() — fácil de cambiar
 * cuando se conecte storage real (ver lib/image-upload.ts).
 */
export function ImageUploader({
  value,
  onChange,
  label = 'Imagen',
  hint,
  sizeClass = 'h-32 w-32'
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Permitir re-subir el mismo archivo
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        <div className="flex items-start gap-3">
          <div className={cn(
            'relative flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50',
            sizeClass
          )}>
            <img
              src={value}
              alt="Producto"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="block w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50"
            >
              Quitar imagen
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            dragOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'
          )}
        >
          {uploading ? (
            <>
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="text-xs text-slate-500">Procesando imagen...</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400">
                <Icon.Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Arrastra una imagen o haz click
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG o WebP · máx. 800×800px
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-danger-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
