import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import Loading from '@/routes/Loading';

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

  const isFullyReady = isReady && (
    !isAuthenticated || // 미로그인이면 바로 준비 완료
    gameInfo.status !== undefined // 로그인이면 게임 상태까지 확인
  );

  if (!isFullyReady) {
    return <Loading />; 
  }

  const currentStatus = gameInfo.status;

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
    return <Navigate to={redirectPath} replace />;
  }

  // 허용된 상태면 컴포넌트 렌더링
  return <Outlet />;
};



export default GameStatusGuard;

export const GameOnlyGuard = () => (
  <GameStatusGuard 
    allowedStatuses={['IN_GAME']} 
    redirectByStatus={{
      IN_NONE: '/main',
      IN_WAITING: '/room'
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
      IN_WAITING: '/room', 
      IN_GAME: '/home'
    }}
  />
);