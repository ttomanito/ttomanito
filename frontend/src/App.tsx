// src/App.tsx

import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'
import AppRoutes from '@/routes/routes'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/routes/Loading'
import AppInitializer from '@/components/app/AppInitializer' // 🔥 1. Initializer 임포트

export default function App() {

  return (
    <Router>
      {/* 🔥 2. AppInitializer로 감싸기 */}
      <AppInitializer> 
        <Suspense fallback={<Loading />}>
          <Toaster />
          <AppRoutes />
        </Suspense>
      </AppInitializer>
    </Router>
  )
}