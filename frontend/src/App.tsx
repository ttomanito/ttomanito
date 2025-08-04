// src/App.tsx

import { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from '@/routes/routes'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/routes/Loading'           // ← 경로만 변경

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Toaster />
        <AppRoutes />
      </Suspense>
    </Router>
  )
}
