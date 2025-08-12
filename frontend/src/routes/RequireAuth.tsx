// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/authStore'
import Loading from '@/routes/Loading'

export default function RequireAuth() {
  const hydrated = useAuth((s) => s.hydrated)
  const isAuthed  = useAuth((s) => s.isAuthenticated)

  const loc = useLocation()

  if (!hydrated) return <Loading />
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc }} />

  return <Outlet />
}
