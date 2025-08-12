// ===================================
// src/routes/GameStatusGuard.tsx
// ===================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import Loading from '@/routes/Loading';

// 🔥 백엔드 응답과 동일하게 맞춤
type GameStatus = 'IN_NONE' | 'IN_WAITING' | 'IN_GAME';

interface GameStatusGuardProps {
  allowedStatuses: GameStatus[];
  redirectTo?: string;
  redirectByStatus?: {
    IN_NONE?: string;
    IN_WAITING?: string;
    IN_GAME?: string;
  };
}


const GameStatusGuard = ({ 
  allowedStatuses, 
  redirectTo = '/', 
  redirectByStatus 
}: GameStatusGuardProps) => {
  const { 
    isAuthenticated, 
    isReady,
    gameInfo
  } = useAuth();
  const location = useLocation();

  // 🔥 개선: 더 안전한 로딩 체크
  const isFullyReady = isReady && (
    !isAuthenticated || // 미로그인이면 바로 준비 완료
    gameInfo.status !== undefined // 로그인이면 게임 상태까지 확인
  );

  // 로딩 중 (완전한 초기화 대기)
  if (!isFullyReady) {
    return <Loading />; // 🔥 변경: 통일된 Loading 컴포넌트 사용
  }

  // 🔥 제거: RequireAuth에서 이미 인증 체크 완료
  // GameStatusGuard는 게임 상태만 체크하면 됨

  const currentStatus = gameInfo.status;

  console.log(`[GUARD] 현재 상태: ${currentStatus}, 허용 상태: [${allowedStatuses.join(', ')}], 경로: ${location.pathname}`);

  // 상태 체크 완료 후 리다이렉트 판단
  if (!allowedStatuses.includes(currentStatus)) {
    let redirectPath = redirectTo; // 기본값

    // 상태별 리다이렉트 확인
    if (redirectByStatus && redirectByStatus[currentStatus]) {
      redirectPath = redirectByStatus[currentStatus]!;
    }

    // IN_WAITING 특별 처리 (roomId 추가)
    if (currentStatus === 'IN_WAITING' && gameInfo.roomId && redirectPath === '/room') {
      redirectPath = `/room/${gameInfo.roomId}`;
    }

    console.log(`[GUARD] ${currentStatus} 상태로 ${redirectPath}로 리다이렉트`);
    return <Navigate to={redirectPath} replace />;
  }

  // 허용된 상태면 컴포넌트 렌더링
  return <Outlet />;
};



export default GameStatusGuard;

// 🔥 백엔드 응답과 동일한 상태명 사용
export const GameOnlyGuard = () => (
  <GameStatusGuard 
    allowedStatuses={['IN_GAME']} 
    redirectByStatus={{
      IN_NONE: '/main',
      IN_WAITING: '/room' // 실제 roomId로 리다이렉트됨
    }}
  />
);

export const NonGameGuard = () => (
  <GameStatusGuard 
    allowedStatuses={['IN_NONE', 'IN_WAITING']} 
    redirectTo="/home"
  />
);

export const WaitingOnlyGuard = () => (
  <GameStatusGuard 
    allowedStatuses={['IN_WAITING']} 
    redirectByStatus={{
      IN_NONE: '/main',
      IN_GAME: '/home'
    }}
  />
);

export const NoneOnlyGuard = () => (
  <GameStatusGuard 
    allowedStatuses={['IN_NONE']} 
    redirectByStatus={{
      IN_WAITING: '/room', // 실제 roomId로 리다이렉트됨
      IN_GAME: '/home'
    }}
  />
);