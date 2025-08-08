// src/pages/WaitingRoomPageSimple.tsx
import { Box, Text, Button, VStack, Spinner } from '@chakra-ui/react';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRequest, postRequest, deleteRequest } from '@/api/requests';

import ProfileList from '@/components/lists/ProfileList';
import { useWaitingRoomSocket, type Participant } from '@/utils/useWaitingRoomSocket';
import { useAuth } from '@/stores/authStore';

const WaitingRoomPageSimple = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const myUserId = useAuth((s) => s.user?.id);
  const { connected, participants, connect, disconnect } = useWaitingRoomSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [initialParticipants, setInitialParticipants] = useState<Participant[]>([]);
  const connectingRef = useRef(false); // 👈 중복 connect 방지

  // 1) 페이지 진입 시 참가자 목록 먼저 조회
  const fetchParticipants = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    try {
      const list = await getRequest<Participant[]>(`/room/${roomId}/participants`);
      setInitialParticipants(list);
    } catch (e) {
      console.error('참가자 목록 조회 실패:', e);
      alert('참가자 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // 2) 목록에 '나'가 있는지 확인 (문자열 비교로 통일)
  const hasMe = useMemo(() => {
    if (!myUserId) return false;
    return initialParticipants.some((p) => String(p.userId) === String(myUserId));
  }, [initialParticipants, myUserId]);

  // 3) 내가 있으면 자동 연결 (없으면 연결하지 않음)
  useEffect(() => {
    if (!roomId) return;
    if (hasMe && !connected && !connectingRef.current) {
      connectingRef.current = true;
      connect(roomId, initialParticipants);
      // onConnect에서 connected=true가 되면 자연스럽게 가드 해제됨
      setTimeout(() => (connectingRef.current = false), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, hasMe, connected]); // initialParticipants는 의존성에서 제외(불필요 재연결 방지)

  // 언마운트 시 정리 (DB 주도 브로드캐스트 구조이므로 WS로 EXIT 안 보냄)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 참여하기(내가 없을 때만 사용) — API 호출 후 목록 재조회 → 서버가 WS로 브로드캐스트
  const handleJoin = async () => {
    if (!roomId || !myUserId) return;
    try {
      await postRequest(`/room/${roomId}/message`, { message: '참여합니다.' });
      await fetchParticipants(); // 최신 목록 반영 (WS 수신 전 초기 뷰 보정)
    } catch (e) {
      console.error('참여 실패:', e);
      alert('참여 요청에 실패했습니다.');
    }
  };

  // 나가기 — API 호출, 연결되어 있으면 끊기, 그리고 목록 재조회
const handleLeave = async () => {
  if (!roomId || !myUserId) return;
  try {
    await deleteRequest(`/room/${roomId}/exit`);

    // hasMe 즉시 false 만들기 → 내 ID 제거
    setInitialParticipants(prev =>
      prev.filter(p => String(p.userId) !== String(myUserId))
    );

    if (connected) disconnect();

    // 필요하면 최종 동기화
    await fetchParticipants();
  } catch (e) {
    console.error('나가기 실패:', e);
    alert('나가기 요청에 실패했습니다.');
  }
};

  // 리스트 소스: 연결됐으면 소켓의 participants, 아니면 초기 조회 리스트
  const listForRender = connected ? participants : initialParticipants;
  const profileListData = listForRender.map((p) => ({
    name: `User ID: ${p.userId}`,
    statusMessage: p.statusMessage || '대기 중...',
  }));

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" height="100vh">
        <VStack>
          <Spinner size="xl" />
          <Text mt={4}>참가자 목록을 불러오는 중...</Text>
        </VStack>
      </Box>
    );
  }

  // 액션 버튼: 내가 목록에 있으면(참가자 O) 나가기, 없으면(참가자 X) 참여하기
  const actionButton = hasMe ? (
    <Button colorScheme="red" onClick={handleLeave}>
      나가기
    </Button>
  ) : (
    <Button colorScheme="green" onClick={handleJoin} disabled={!myUserId}>
      참여하기
    </Button>
  );

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            대기실 (Room ID: {roomId})
          </Text>
          <Text>내 ID: {myUserId || '로그인 필요'}</Text>
          <Text>연결 상태: {connected ? '✅ 연결됨' : '❌ 끊어짐'}</Text>
        </Box>

        {actionButton}

        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            참가자 목록 ({listForRender.length}명)
          </Text>
          <ProfileList data={profileListData} />
        </Box>
      </VStack>
    </Box>
  );
};

export default WaitingRoomPageSimple;
