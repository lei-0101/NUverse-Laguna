import { useEffect } from 'react'

/**
 * Guards against accidental browser refresh / tab-close when the form is dirty.
 * useBlocker requires a data-router (createBrowserRouter) which this app does
 * not use, so we rely on the beforeunload event for hard-navigation protection.
 */
export function useLeaveGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
