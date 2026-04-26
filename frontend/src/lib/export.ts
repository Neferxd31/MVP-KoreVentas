// Helpers para exportar datos a CSV (compatible Excel/Google Sheets) y disparar descarga.
// Sin dependencias externas — todo nativo del navegador.

/**
 * Convierte un array de objetos a string CSV.
 * - Detecta automáticamente las cabeceras de la primera fila si no se pasan.
 * - Escapa comas, comillas y saltos de línea según RFC 4180.
 * - Antepone BOM UTF-8 para que Excel detecte tildes correctamente.
 */
export function toCsv<T extends Record<string, any>>(
  rows: T[],
  options?: { headers?: { key: keyof T; label: string }[] }
): string {
  if (rows.length === 0) return ''

  const headers = options?.headers ?? Object.keys(rows[0]).map(k => ({ key: k as keyof T, label: k }))

  const escapeCell = (v: any): string => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const lines = [
    headers.map(h => escapeCell(h.label)).join(','),
    ...rows.map(row => headers.map(h => escapeCell(row[h.key])).join(','))
  ]

  // BOM para que Excel lea UTF-8 con tildes
  return '﻿' + lines.join('\n')
}

/**
 * Dispara la descarga de un string como archivo en el navegador.
 */
export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Atajo: convierte filas a CSV y dispara descarga.
 */
export function exportCsv<T extends Record<string, any>>(
  rows: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
) {
  const csv = toCsv(rows, { headers })
  downloadFile(csv, filename)
}

/**
 * Sufijo de fecha para nombres de archivo: 2026-04-25.
 */
export function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10)
}
