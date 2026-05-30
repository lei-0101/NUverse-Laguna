import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from './paths'

interface Props {
  /** Where to redirect authenticated users. Defaults to paths.dashboard. */
  redirectTo?: string
  /** When provided, renders this directly instead of an Outlet. */
  children?: ReactNode
}

/** Keeps already-authenticated users away from public-only screens. */
export function PublicOnlyRoute({ redirectTo, children }: Props = {}) {
  const user = useAuthStore((state) => state.user)

  if (user) {
    return <Navigate to={redirectTo ?? paths.dashboard} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
