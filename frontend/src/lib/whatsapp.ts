// Helpers para generar enlaces de WhatsApp (wa.me) con mensaje pre-cargado.
// El usuario toca el botón, se abre WhatsApp y solo le queda presionar enviar.

/**
 * Normaliza un número a formato internacional sin + ni espacios.
 * Si no tiene indicativo, asume Colombia (+57).
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  // Ya tiene indicativo país (10+ dígitos con 57 al inicio, o empieza en 1 EEUU, etc.)
  if (digits.length > 10 && !digits.startsWith('0')) return digits
  // Celular colombiano (10 dígitos empezando en 3)
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`
  // Fijo colombiano
  if (digits.length === 10) return `57${digits}`
  return digits
}

export function waLink(phone: string | null | undefined, message: string): string | null {
  const n = normalizePhone(phone)
  if (!n) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

// Plantillas de mensaje listas para usar
export const waTemplates = {
  birthday: (name: string) =>
    `¡Feliz cumpleaños ${name}! 🎂🎉 Te deseamos un día increíble. Gracias por ser parte de nuestra familia.`,

  reactivation: (name: string) =>
    `Hola ${name}, ¡te extrañamos! Hace tiempo no te vemos por acá. Pásate pronto, tenemos novedades que te van a encantar. 💜`,

  appointmentReminder: (name: string, serviceName: string, when: string) =>
    `Hola ${name}, te recordamos tu cita para ${serviceName} el ${when}. ¡Te esperamos! Si necesitas reprogramar, responde este mensaje.`,

  appointmentConfirmation: (name: string, serviceName: string, when: string) =>
    `Hola ${name}, confirmamos tu cita para ${serviceName} el ${when}. ¡Nos vemos!`,

  thankYou: (name: string) =>
    `¡Gracias por tu compra ${name}! Fue un gusto atenderte. Vuelve pronto. 🙌`,

  generic: (name: string) => `Hola ${name}, `
}
