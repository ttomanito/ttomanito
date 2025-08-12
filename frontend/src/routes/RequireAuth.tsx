// ===================================
// src/routes/RequireAuth.tsx
// ===================================
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/authStore'
import Loading from '@/routes/Loading'

export default function RequireAuth() {
  const isReady = useAuth((s) => s.isReady) // 🔥 변경: hydrated → isReady
  const isAuthed = useAuth((s) => s.isAuthenticated)
  const loc = useLocation()

  if (!isReady) return <Loading />
  
  if (!isAuthed) {
    // 🔥 변경: localStorage에 리다이렉트 정보 저장
    const redirectData = {
      url: loc.pathname + loc.search,
      timestamp: Date.now()
    }
    localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectData))
    
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}