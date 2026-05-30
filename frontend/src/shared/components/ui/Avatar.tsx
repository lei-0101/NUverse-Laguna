import { cn } from '@/shared/lib/cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

/** Circular avatar that falls back to the user's initials when no image is set. */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    sizes[size],
    className,
  )

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(base, 'object-cover')}
        loading="lazy"
      />
    )
  }

  return (
    <span
      className={cn(base, 'bg-primary font-semibold text-primary-foreground')}
      aria-label={name}
      role="img"
    >
      {initials(name)}
    </span>
  )
}
