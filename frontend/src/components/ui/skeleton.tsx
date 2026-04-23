import { cn } from '@/lib/utils'

interface Props {
  className?: string
  count?: number
}

// Base skeleton — usa la clase global .skeleton del index.css
export function Skeleton({ className }: Props) {
  return <div className={cn('skeleton', className)} />
}

// Skeleton para filas de tabla (lo usamos en productos y clientes)
export function SkeletonRows({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-10 flex-1', c === 0 && 'flex-[2]')} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Skeleton para tarjetas del dashboard
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  )
}
