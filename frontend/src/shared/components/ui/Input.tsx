import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  endAdornment?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, endAdornment, id, className, onFocus, onBlur, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId     = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold tracking-wide transition-colors duration-200"
          style={{ color: focused ? 'var(--color-primary)' : 'var(--color-foreground)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Animated focus glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl transition-all duration-300"
          style={{
            boxShadow: focused
              ? error
                ? '0 0 0 3px rgba(239,68,68,0.15)'
                : '0 0 0 3px rgba(74,110,232,0.15)'
              : 'none',
          }}
        />
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onFocus={(e) => { setFocused(true); onFocus?.(e) }}
          onBlur={(e)  => { setFocused(false); onBlur?.(e) }}
          className={cn(
            'h-12 w-full rounded-xl border-[1.5px] bg-surface px-4 text-[15px] text-foreground outline-none',
            'placeholder:text-muted-foreground/60 transition-all duration-200',
            endAdornment ? 'pr-12' : undefined,
            error
              ? 'border-danger'
              : focused
              ? 'border-primary/60'
              : 'border-border hover:border-primary/30',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <span className="absolute inset-y-0 right-3 flex items-center">{endAdornment}</span>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-[13px] text-danger">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
})
