import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft disabled:bg-brand-300',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-50 disabled:text-slate-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-soft disabled:bg-danger-300',
  success:
    'bg-success-600 text-white hover:bg-success-700 active:bg-success-700 shadow-soft disabled:bg-success-500/60',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 disabled:text-slate-400'
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
  xl: 'h-14 px-6 text-lg gap-2.5'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-all duration-150 ease-out',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        fullWidth && 'w-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
})
