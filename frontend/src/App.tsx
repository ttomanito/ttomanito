// src/App.tsx
import { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from '@/routes'

export default function App() {
  return (
    <Router>
      <Suspense fallback={<p>Loading…</p>}>
        <AppRoutes />
      </Suspense>
    </Router>
  )
}
