import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from './paths'

/** Gate for authenticated routes; redirects to login, preserving the target. */
export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
