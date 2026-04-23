import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-slate-700 transition-colors dark:text-slate-300">
            {label}
          </label>
        )}
        
        {/* Contenedor del Input */}
        <div
          className={cn(
            "relative flex items-center overflow-hidden rounded-xl border bg-slate-50 transition-all duration-200 dark:bg-slate-900/50",
            // Estado Normal
            "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
            // Estado Enfocado (Focus) -> Aquí ocurre la magia
            "focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 dark:focus-within:border-brand-400 dark:focus-within:bg-slate-950 dark:focus-within:ring-brand-400/10",
            className
          )}
        >
          {/* Ícono Izquierdo (si existe) */}
          {leftIcon && (
            <div className="flex items-center justify-center pl-3.5 text-slate-400 transition-colors dark:text-slate-500 group-focus-within:text-brand-500">
              {leftIcon}
            </div>
          )}
          
          {/* El Input real */}
          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500",
              leftIcon ? "pl-2.5" : ""
            )}
            {...props}
          />
        </div>

        {/* Texto de ayuda (Hint) */}
        {hint && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'