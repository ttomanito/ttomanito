// src/App.tsx
import { useEffect, useRef } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'
import AppRoutes from '@/routes/routes'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/routes/Loading'
import { useAuth } from '@/stores/authStore'

export default function App() {
  const { bootstrapFromServer } = useAuth()
  const booted = useRef(false)

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    // 🔑 HttpOnly 쿠키 기반으로 서버에 물어봐서 세션 복원
    bootstrapFromServer()
    // authStore 안에서 markHydrated()를 호출하므로
    // RequireAuth는 그 신호를 보고 라우팅 판단하면 됨
  }, [bootstrapFromServer])

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Toaster />
        <AppRoutes />
      </Suspense>
    </Router>
  )
}
