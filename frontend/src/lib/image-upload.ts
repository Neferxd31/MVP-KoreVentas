// Adapter de subida de imágenes — punto único de cambio cuando se conecte storage real.
//
// HOY (sin backend de archivos):
//   - Convierte el File a data URL base64
//   - Comprime / redimensiona en el navegador para no inflar la BD
//   - Devuelve un string que cabe en la columna text imageUrl
//
// MAÑANA (con S3 / Cloudflare R2 / similar):
//   - Reemplazar el cuerpo de uploadImage por:
//       const formData = new FormData()
//       formData.append('file', file)
//       const { data } = await api.post<{ url: string }>('/uploads', formData)
//       return data.url
//   - Todo el resto del código sigue funcionando porque siempre se manipula la URL.

const MAX_DIMENSION = 800        // px — máximo lado mayor
const JPEG_QUALITY = 0.82        // 0..1
const MAX_RESULT_SIZE = 500_000  // ~500 KB en data URL (~370 KB binario)

/**
 * Sube una imagen y devuelve una URL utilizable en <img src=...>.
 * En modo demo guarda data URL; en producción debería retornar URL HTTPS.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen (JPG, PNG, WebP).')
  }

  const compressed = await compressImage(file)

  if (compressed.length > MAX_RESULT_SIZE) {
    throw new Error('La imagen es muy pesada incluso comprimida. Usa una más pequeña.')
  }

  return compressed
}

/**
 * Redimensiona y recomprime la imagen en canvas. Devuelve un data URL JPEG.
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagen inválida o corrupta.'))
      img.onload = () => {
        const { width, height } = img
        const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
        const targetW = Math.round(width * scale)
        const targetH = Math.round(height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Tu navegador no soporta procesamiento de imágenes.'))
          return
        }
        ctx.drawImage(img, 0, 0, targetW, targetH)
        // toDataURL es síncrono — para imágenes <800px es instantáneo
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
