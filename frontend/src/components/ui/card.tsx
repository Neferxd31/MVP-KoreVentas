import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

export function Card({ interactive, padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-soft',
        interactive && 'transition-shadow hover:shadow-soft-md',
        paddingClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800 truncate">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
