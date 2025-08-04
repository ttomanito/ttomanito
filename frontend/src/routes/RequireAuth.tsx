// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import Loading from '@/routes/Loading'     // 동일 로더

export default function RequireAuth() {
  const hydrated = useAuth(s => s.hydrated)
  const isAuthed = useAuth(s => s.isAuthenticated)
  const loc      = useLocation()

  if (!hydrated) return <Loading />           // 재수화 대기

  if (!isAuthed)  return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}
