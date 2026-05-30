import { Spinner } from './Spinner'

interface LoaderProps {
  label?: string
  fullScreen?: boolean
}

/** Centered loading indicator for page- or section-level pending states. */
export function Loader({ label = 'Loading…', fullScreen = false }: LoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-svh flex-col items-center justify-center gap-3'
          : 'flex flex-col items-center justify-center gap-3 py-12'
      }
    >
      <Spinner className="h-7 w-7 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
