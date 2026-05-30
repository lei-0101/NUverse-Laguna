import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/** Catches render-phase errors and shows a friendly fallback instead of a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 text-center">
        <div className="mx-auto max-w-sm">
          {/* Bulldog face SVG */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-6 opacity-60" aria-hidden="true">
            <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" className="text-border"/>
            <circle cx="30" cy="34" r="5" fill="currentColor" className="text-muted-foreground"/>
            <circle cx="50" cy="34" r="5" fill="currentColor" className="text-muted-foreground"/>
            <circle cx="31" cy="33" r="1.5" fill="currentColor" className="text-surface"/>
            <circle cx="51" cy="33" r="1.5" fill="currentColor" className="text-surface"/>
            <ellipse cx="40" cy="48" rx="10" ry="6" fill="currentColor" className="text-muted-foreground"/>
            <path d="M32 50 Q40 44 48 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-surface"/>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Arf! Something crashed.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The Bulldog ran into something unexpected. Don't worry — your data is safe.
          </p>
          {this.state.error && (
            <details className="mt-4 rounded-lg border border-border bg-surface-muted p-3 text-left">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Technical details
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-danger">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }
}
