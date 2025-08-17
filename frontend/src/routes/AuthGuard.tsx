import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/authStore'
import Loading from '@/routes/Loading'
interface PreventAuthGuardProps {
  redirectTo?: string;
}

export const PreventAuthGuard = ({ 
  redirectTo = '/main' 
}: PreventAuthGuardProps) => {
  const { isAuthenticated, isReady } = useAuth();

  // 로딩 중
  if (!isReady) {
    return <Loading />;
  }

  // 로그인된 상태면 리다이렉트
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

// 기존 RequireAuth 컴포넌트 → RequireAuthGuard로 변경
export default function RequireAuthGuard() {
  const isReady = useAuth((s) => s.isReady) // 🔥 변경: hydrated → isReady
  const isAuthed = useAuth((s) => s.isAuthenticated)
  const loc = useLocation()

  if (!isReady) return <Loading />
  
  if (!isAuthed) {
    // localStorage에 리다이렉트 정보 저장
    const redirectData = {
      url: loc.pathname + loc.search,
      timestamp: Date.now()
    }
    localStorage.setItem('redirectAfterLogin', JSON.stringify(redirectData))
    
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}