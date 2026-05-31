import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'icon'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold select-none ' +
  'transition-all duration-200 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
  'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] overflow-hidden'

const variants: Record<ButtonVariant, string> = {
  primary:
    'rounded-xl bg-primary text-primary-foreground ' +
    'hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(31,58,138,0.28)] ' +
    'before:absolute before:inset-0 before:rounded-xl ' +
    'before:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.14)_50%,transparent_70%)] ' +
    'before:bg-[length:200%] before:bg-[-200%_center] before:transition-[background-position] before:duration-0 ' +
    'hover:before:bg-[200%_center] hover:before:duration-500',

  accent:
    'rounded-xl bg-accent text-accent-foreground font-bold ' +
    'hover:shadow-[0_4px_20px_rgba(245,179,0,0.38)] hover:brightness-105 ' +
    'before:absolute before:inset-0 before:rounded-xl ' +
    'before:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.22)_50%,transparent_70%)] ' +
    'before:bg-[length:200%] before:bg-[-200%_center] before:transition-[background-position] before:duration-0 ' +
    'hover:before:bg-[200%_center] hover:before:duration-500',

  secondary:
    'rounded-xl bg-surface-muted text-foreground border border-border ' +
    'hover:border-border/80 hover:bg-surface hover:shadow-[var(--shadow-sm)]',

  ghost:
    'rounded-lg text-foreground hover:bg-surface-muted',

  danger:
    'rounded-xl bg-danger text-danger-foreground ' +
    'hover:shadow-[0_4px_16px_rgba(217,45,32,0.28)] hover:brightness-105',

  icon:
    'rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground p-0 aspect-square',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9  px-3.5 text-sm',
  md: 'h-11 px-5   text-sm',
  lg: 'h-12 px-7   text-base',
}

const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-9  w-9',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon'
  return (
    <button
      className={cn(
        base,
        variants[variant],
        isIcon ? iconSizes[size] : sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="h-4 w-4 shrink-0" />
          {!isIcon && <span className="opacity-70">{children}</span>}
        </>
      ) : (
        children
      )}
    </button>
  )
}
