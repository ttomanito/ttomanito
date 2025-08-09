// src/App.tsx

import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'

import AppRoutes from '@/routes/routes'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/routes/Loading'

import Cookies from 'js-cookie'
import { useAuth } from '@/stores/authStore'
import { jwtParser } from '@/utils/jwtparser'

export default function App() {
  const auth = useAuth()

  useEffect(() => {
    const accessToken = Cookies.get('accessToken')
    if (accessToken && !auth.tokens.accessToken) {
      auth.setTokens({ accessToken, refreshToken: null })

      const claims = jwtParser(accessToken)
      if (claims) {
        auth.setUser({
          id: claims.sub,
          name: claims.username,
        })
        } else {
          if (import.meta.env.DEV) {
            console.warn('⚠️ accessToken 파싱 실패 - 토큰이 잘못됐거나 만료됨')
            console.log('토큰 값:', accessToken)
          }
        }
    }
  })

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Toaster />
        <AppRoutes />
      </Suspense>
    </Router>
  )
}
