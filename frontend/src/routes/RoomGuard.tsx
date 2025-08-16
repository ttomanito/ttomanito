import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { getRequest } from '@/api/requests';
import Loading from '@/routes/Loading';

type RoomStatus = 'NONE' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

interface RoomInfo {
  roomId: number;
  creatorId: number;
  name: string;
  status: RoomStatus;
  startDate: string;
  endDate: string;
  missionDays: string[];
}

const RoomGuard = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { isAuthenticated, isReady, user, gameInfo } = useAuth();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기화 대기
  if (!isReady) {
    return <Loading />;
  }

  // 로그인 확인 (RoomGuard는 RequireAuthGuard 안에 있어야 함)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // roomId 확인
  if (!roomId) {
    return <Navigate to="/main" replace />;
  }

  // 방 정보 로딩
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getRequest<RoomInfo>(`/room/${roomId}`);
        setRoomInfo(data);
      } catch {
        setError('방을 찾을 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  // 로딩 중
  if (loading) {
    return <Loading />;
  }

  // 에러 발생 시
  if (error || !roomInfo) {
    return <Navigate to="/main" replace />;
  }

  const currentRoomStatus = roomInfo.status;

  

  // 방 상태별 접근 제어
  switch (currentRoomStatus) {
    case 'NOT_STARTED':
      // 대기방 상태 - 유일하게 접근 허용되는 경우
      // 추가 검증: 이미 다른 방에 참여 중인지 확인
      if (gameInfo.status === 'IN_GAME') {
        // 다른 게임이 진행 중이면 해당 게임으로 리다이렉트
        return <Navigate to="/home" replace />;
      }
      if (gameInfo.status === 'IN_WAITING' && gameInfo.roomId && gameInfo.roomId !== parseInt(roomId)) {
        // 다른 대기방에 참여 중이면 해당 대기방으로 리다이렉트
        return <Navigate to={`/room/${gameInfo.roomId}`} replace />;
      }
      break;

    case 'NONE':
      // 방이 존재하지 않음 - 접근 불가
      return <Navigate to="/main" replace />;

    case 'IN_PROGRESS':
      // 게임 진행 중 - 대기방 접근 불가 (게임이 시작됨)
      if (gameInfo.status === 'IN_GAME') {
        // 게임 중이면 홈으로 리다이렉트
        return <Navigate to="/home" replace />;
      } else {
        // 게임 중이 아니면 메인으로
        return <Navigate to="/main" replace />;
      }

    case 'FINISHED':
      // 게임 종료됨 - 접근 불가
      return <Navigate to="/main" replace />;

    default:
      // 알 수 없는 상태 - 접근 불가
      return <Navigate to="/main" replace />;
  }

  // 모든 검증 통과 - 대기방 접근 허용
  return <Outlet />;
};

export default RoomGuard;