import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore, type AuthUser } from '@/shared/store/authStore'

const user: AuthUser = {
  id: '1',
  email: 'a@national-u.edu.ph',
  fullName: 'Test User',
  role: 'ROLE_STUDENT',
  status: 'ACTIVE',
}

function renderAt() {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret content</div>} />
        </Route>
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isBootstrapped: true })
  })

  it('redirects to login when unauthenticated', () => {
    renderAt()
    expect(screen.getByText(/login screen/i)).toBeInTheDocument()
    expect(screen.queryByText(/secret content/i)).not.toBeInTheDocument()
  })

  it('renders the protected content when authenticated', () => {
    useAuthStore.setState({ user, isBootstrapped: true })
    renderAt()
    expect(screen.getByText(/secret content/i)).toBeInTheDocument()
  })
})
