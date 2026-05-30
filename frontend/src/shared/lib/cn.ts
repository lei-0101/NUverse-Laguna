type ClassValue = string | false | null | undefined

/** Minimal className joiner — keeps truthy values, no external dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
