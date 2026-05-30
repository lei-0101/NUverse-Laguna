import { useAuthStore } from '@/shared/store/authStore'
import { useSessionBootstrap } from '@/modules/auth/hooks/useAuth'
import { AppRoutes } from '@/shared/routes/AppRoutes'
import { Loader, ToastContainer } from '@/shared/components/ui'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

/**
 * Resolves the session once before rendering routes, so guards never redirect
 * on a flash of "logged out" while /auth/me is still in flight.
 */
function App() {
  useSessionBootstrap()
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped)

  if (!isBootstrapped) {
    return <Loader fullScreen label="Starting NUverse Laguna…" />
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
