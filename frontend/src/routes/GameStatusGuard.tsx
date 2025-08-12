// src/routes/GameStatusGuard.tsx (개선된 버전)
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { Spinner, VStack, Text, Box } from '@chakra-ui/react';

type UserStatus = 'IN_NONE' | 'IN_WAITING' | 'IN_GAME';

interface GameStatusGuardProps {
  allowedStatuses: UserStatus[];
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
    hydrated, 
    userGameStatus, 
    currentRoomId, 
    checkUserGameStatus 
  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      if (!hydrated || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        // 🔥 authStore의 함수 사용
        await checkUserGameStatus();
        console.log('[GUARD] 사용자 상태:', userGameStatus, '현재 경로:', location.pathname);
      } catch (error) {
        console.error('[GUARD] 상태 확인 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, hydrated, location.pathname, checkUserGameStatus]);

  // 로딩 중
  if (!hydrated || isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" height="100vh">
        <VStack>
          <Spinner size="xl" />
          <Text mt={4}>상태 확인 중...</Text>
        </VStack>
      </Box>
    );
  }

  // 로그인되지 않음
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 상태 체크 완료 후 리다이렉트 판단
  if (userGameStatus && !allowedStatuses.includes(userGameStatus)) {
    // 🔥 대기 중이고 currentRoomId가 있으면 실제 방 번호로 리다이렉트
    if (userGameStatus === 'IN_WAITING' && currentRoomId && redirectByStatus?.IN_WAITING === '/room') {
      console.log(`[GUARD] 대기방 ${currentRoomId}로 리다이렉트`);
      return <Navigate to={`/room/${currentRoomId}`} replace />;
    }

    // 상태별 리다이렉트가 정의되어 있으면 해당 경로로
    if (redirectByStatus && redirectByStatus[userGameStatus]) {
      console.log(`[GUARD] ${userGameStatus} 상태로 ${redirectByStatus[userGameStatus]}로 리다이렉트`);
      return <Navigate to={redirectByStatus[userGameStatus]!} replace />;
    }
    
    // 기본 리다이렉트
    console.log(`[GUARD] ${userGameStatus} 상태로 ${redirectTo}로 리다이렉트`);
    return <Navigate to={redirectTo} replace />;
  }

  // 허용된 상태면 컴포넌트 렌더링
  return <Outlet />;
};

export default GameStatusGuard;

// 🔥 개선된 가드들 - 실제 roomId로 리다이렉트 가능
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