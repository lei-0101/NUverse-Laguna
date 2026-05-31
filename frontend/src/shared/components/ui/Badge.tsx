import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export type BadgeVariant = 'solid' | 'soft' | 'outline'
export type BadgeSize    = 'sm' | 'md'
export type BadgeColor   =
  | 'primary' | 'accent' | 'success' | 'danger' | 'warning'
  | 'blue' | 'violet' | 'emerald' | 'amber' | 'red' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?:    BadgeSize
  color?:   BadgeColor
  dot?:     boolean
}

const colorMap: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    solid:   'bg-primary   text-primary-foreground',
    soft:    'bg-primary/12 text-primary dark:bg-primary/20',
    outline: 'border border-primary/50 text-primary',
  },
  accent: {
    solid:   'bg-accent    text-accent-foreground',
    soft:    'bg-accent/15  text-amber-700 dark:text-amber-300',
    outline: 'border border-accent/50 text-amber-700 dark:text-amber-300',
  },
  success: {
    solid:   'bg-success   text-white',
    soft:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    outline: 'border border-emerald-400/50 text-emerald-700 dark:text-emerald-400',
  },
  danger: {
    solid:   'bg-danger    text-danger-foreground',
    soft:    'bg-red-50    text-red-700 dark:bg-red-950/40 dark:text-red-400',
    outline: 'border border-red-400/50 text-red-700 dark:text-red-400',
  },
  warning: {
    solid:   'bg-amber-500 text-white',
    soft:    'bg-amber-50  text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    outline: 'border border-amber-400/50 text-amber-700 dark:text-amber-400',
  },
  blue: {
    solid:   'bg-blue-600  text-white',
    soft:    'bg-blue-50   text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    outline: 'border border-blue-400/50 text-blue-700 dark:text-blue-400',
  },
  violet: {
    solid:   'bg-violet-600 text-white',
    soft:    'bg-violet-50  text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
    outline: 'border border-violet-400/50 text-violet-700 dark:text-violet-400',
  },
  emerald: {
    solid:   'bg-emerald-600 text-white',
    soft:    'bg-emerald-50  text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    outline: 'border border-emerald-400/50 text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    solid:   'bg-amber-500  text-white',
    soft:    'bg-amber-50   text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    outline: 'border border-amber-400/50 text-amber-700 dark:text-amber-400',
  },
  red: {
    solid:   'bg-red-600   text-white',
    soft:    'bg-red-50    text-red-700 dark:bg-red-950/40 dark:text-red-400',
    outline: 'border border-red-400/50 text-red-700 dark:text-red-400',
  },
  gray: {
    solid:   'bg-gray-500  text-white',
    soft:    'bg-gray-100  text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    outline: 'border border-gray-400/50 text-gray-600 dark:text-gray-400',
  },
}

const dotColors: Record<BadgeColor, string> = {
  primary:  'bg-primary',
  accent:   'bg-accent',
  success:  'bg-emerald-500',
  danger:   'bg-red-500',
  warning:  'bg-amber-500',
  blue:     'bg-blue-500',
  violet:   'bg-violet-500',
  emerald:  'bg-emerald-500',
  amber:    'bg-amber-500',
  red:      'bg-red-500',
  gray:     'bg-gray-400',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs     px-2.5 py-1 gap-1.5',
}

export function Badge({
  variant  = 'soft',
  size     = 'md',
  color    = 'primary',
  dot      = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold leading-none whitespace-nowrap',
        colorMap[color][variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('shrink-0 rounded-full', dotColors[color], size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
