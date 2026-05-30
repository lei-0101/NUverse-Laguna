import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, Card, Loader } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useVerifyEmail } from '../hooks/useAuth'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const verify = useVerifyEmail()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || !token) return
    hasRun.current = true
    verify.mutate(token)
  }, [token, verify])

  if (!token) {
    return (
      <Card className="p-6 sm:p-8">
        <Alert variant="error">Missing verification token.</Alert>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold text-foreground">Email verification</h1>

      {verify.isPending && <Loader label="Verifying your email…" />}

      {verify.isSuccess && (
        <>
          <Alert variant="success">{verify.data.message}</Alert>
          <Link
            to={paths.login}
            className="mt-6 block w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Continue to login
          </Link>
        </>
      )}

      {verify.isError && (
        <>
          <Alert variant="error">{toApiError(verify.error).message}</Alert>
          <Link
            to={paths.register}
            className="mt-6 block text-sm font-medium text-primary hover:underline"
          >
            Back to sign up
          </Link>
        </>
      )}
    </Card>
  )
}
