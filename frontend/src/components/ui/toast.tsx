import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icons'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastPayload {
  id: number
  type: ToastType
  title: string
  description?: string
}

interface ToastApi {
  show: (type: ToastType, title: string, description?: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastPayload[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = ++idRef.current
      setToasts(prev => [...prev, { id, type, title, description }])
      // Auto-dismiss
      setTimeout(() => remove(id), type === 'error' ? 6000 : 3500)
    },
    [remove]
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (t, d) => show('success', t, d),
      error: (t, d) => show('error', t, d),
      info: (t, d) => show('info', t, d),
      warning: (t, d) => show('warning', t, d)
    }),
    [show]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Viewport */}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const typeConfig: Record<
  ToastType,
  { bar: string; icon: ReactNode; accent: string }
> = {
  success: {
    bar: 'bg-success-500',
    accent: 'text-success-600',
    icon: <Icon.Check className="h-5 w-5" />
  },
  error: {
    bar: 'bg-danger-500',
    accent: 'text-danger-600',
    icon: <Icon.AlertTriangle className="h-5 w-5" />
  },
  info: {
    bar: 'bg-brand-500',
    accent: 'text-brand-600',
    icon: <Icon.Sparkles className="h-5 w-5" />
  },
  warning: {
    bar: 'bg-warning-500',
    accent: 'text-warning-600',
    icon: <Icon.AlertTriangle className="h-5 w-5" />
  }
}

function ToastItem({ toast, onClose }: { toast: ToastPayload; onClose: () => void }) {
  const c = typeConfig[toast.type]
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft-lg',
        'animate-slide-in-right'
      )}
    >
      <div className={cn('w-1.5 shrink-0', c.bar)} />
      <div className="flex flex-1 items-start gap-3 p-4">
        <div className={cn('mt-0.5', c.accent)}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-slate-500">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition"
          aria-label="Cerrar notificación"
        >
          <Icon.X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
