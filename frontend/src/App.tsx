import { useAuthStore } from '@/shared/store/authStore'
import { useSessionBootstrap } from '@/modules/auth/hooks/useAuth'
import { AppRoutes } from '@/shared/routes/AppRoutes'
import { Loader, ToastContainer } from '@/shared/components/ui'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { SuspensionScreen } from '@/shared/components/SuspensionScreen'
import { LoginLoadingScreen, useLoginLoadingStore } from '@/shared/components/LoginLoadingScreen'

function AppInner() {
  const isLoading = useLoginLoadingStore((s) => s.showing)
  const hideLoading = useLoginLoadingStore((s) => s.hide)

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <SuspensionScreen />
      {isLoading && <LoginLoadingScreen onDone={hideLoading} />}
    </>
  )
}

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
      <AppInner />
    </ErrorBoundary>
  )
}

export default App
