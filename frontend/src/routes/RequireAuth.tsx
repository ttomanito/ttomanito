// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import Loading from '@/routes/Loading'

export default function RequireAuth() {
  const hydrated = useAuth((s) => s.hydrated)

  // ✅ getter 대신 직접 accessToken 여부로 판별
  const accessToken = useAuth((s) => s.tokens.accessToken)
  const isAuthed = !!accessToken

  const loc = useLocation()

  if (!hydrated) return <Loading />
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc }} />

  return <Outlet />
}
