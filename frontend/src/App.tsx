// src/App.tsx

import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'

import AppRoutes from '@/routes/routes'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/routes/Loading'

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
