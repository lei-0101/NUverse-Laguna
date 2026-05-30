import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Blocks navigation away from the current route when `isDirty` is true.
 * Shows the browser's native confirm dialog; if accepted, navigation proceeds.
 * Also blocks hard page reload / tab close via beforeunload.
 */
export function useLeaveGuard(isDirty: boolean) {
  const blocker = useBlocker(isDirty)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('You have unsaved changes. Leave without saving?')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
