import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, id, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div
        className={cn(
          'group flex items-center rounded-lg border bg-white transition-colors',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
          error ? 'border-danger-400' : 'border-slate-300 hover:border-slate-400'
        )}
      >
        {leftIcon && (
          <span className="pl-3 text-slate-400 group-focus-within:text-brand-500">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400',
            'focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400',
            className
          )}
          {...rest}
        />
        {rightSlot && <span className="pr-3">{rightSlot}</span>}
      </div>
      {(hint || error) && (
        <p className={cn('mt-1 text-xs', error ? 'text-danger-600' : 'text-slate-500')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})
