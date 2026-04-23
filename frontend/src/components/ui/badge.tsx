import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink'
type Variant = 'soft' | 'solid' | 'outline'

interface Props {
  tone?: Tone
  variant?: Variant
  size?: 'sm' | 'md'
  leftIcon?: ReactNode
  children: ReactNode
  className?: string
}

const tones: Record<Tone, { soft: string; solid: string; outline: string }> = {
  neutral: {
    soft: 'bg-slate-100 text-slate-700',
    solid: 'bg-slate-700 text-white',
    outline: 'border border-slate-300 text-slate-600'
  },
  brand: {
    soft: 'bg-brand-50 text-brand-700',
    solid: 'bg-brand-600 text-white',
    outline: 'border border-brand-300 text-brand-700'
  },
  success: {
    soft: 'bg-success-50 text-success-700',
    solid: 'bg-success-600 text-white',
    outline: 'border border-success-500/50 text-success-700'
  },
  warning: {
    soft: 'bg-warning-50 text-warning-700',
    solid: 'bg-warning-600 text-white',
    outline: 'border border-warning-500/50 text-warning-700'
  },
  danger: {
    soft: 'bg-danger-50 text-danger-700',
    solid: 'bg-danger-600 text-white',
    outline: 'border border-danger-500/50 text-danger-700'
  },
  info: {
    soft: 'bg-sky-50 text-sky-700',
    solid: 'bg-sky-600 text-white',
    outline: 'border border-sky-300 text-sky-700'
  },
  purple: {
    soft: 'bg-purple-50 text-purple-700',
    solid: 'bg-purple-600 text-white',
    outline: 'border border-purple-300 text-purple-700'
  },
  pink: {
    soft: 'bg-pink-50 text-pink-700',
    solid: 'bg-pink-600 text-white',
    outline: 'border border-pink-300 text-pink-700'
  }
}

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs'
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  leftIcon,
  className,
  children
}: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        tones[tone][variant],
        sizes[size],
        className
      )}
    >
      {leftIcon}
      {children}
    </span>
  )
}
