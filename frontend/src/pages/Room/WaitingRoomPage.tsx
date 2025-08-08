import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRequest, postRequest } from '@/api/requests';

import ProfileList from '@/components/lists/ProfileList';
import { useWaitingRoomSocket, type Participant } from '@/utils/useWaitingRoomSocket';

import { useAuth } from '@/stores/authStore';

const WaitingRoomPageSimple = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const myUserId = useAuth((state) => state.user?.id);

  const { connected, participants, connect, disconnect, sendMessage } = useWaitingRoomSocket();

  // '참여하기' 버튼 클릭 시 실행
  const handleEnterRoom = async () => {
    if (!roomId || !myUserId || connected) return;

    try {
      const initialParticipants = await getRequest<Participant[]>(`/room/${roomId}/participants`);
      
      connect(roomId, initialParticipants);

    } catch (err) {
      console.error('방 입장 실패:', err);
      alert('방 입장에 실패했습니다.');
    }
  };

  // '나가기' 버튼 클릭 시 실행
  const handleLeaveRoom = async () => {
    if (!roomId || !myUserId || !connected) return;

    try {
      // 1. 서버에 DB 상태 변경을 위한 API 요청 (HTTP POST)
      await postRequest(`/room/${roomId}/exit`);

      // 2. 다른 클라이언트에게 실시간 알림 (WebSocket)
      sendMessage('EXIT', { roomId, userId: myUserId });

      // 3. 내 소켓 연결 종료
      disconnect();

    } catch (err) {
      console.error('나가기 처리 중 오류 발생:', err);
      alert('나가기 요청에 실패했습니다.');
    }
  };
  // 연결 성공 시 'ENTER' 메시지 자동 전송
  useEffect(() => {
    if (connected && roomId && myUserId) {
      sendMessage('ENTER', { roomId, userId: myUserId });
    }
  }, [connected, roomId, myUserId, sendMessage]);

  // 페이지 이탈 시 자동 연결 종료
  useEffect(() => {
    return () => {
      if (connected && roomId && myUserId) {
        sendMessage('EXIT', { roomId, userId: myUserId });
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, connected, myUserId]);

  const profileListData = participants.map((p: Participant) => ({
    name: `User ID: ${p.userId}`,
    statusMessage: p.statusMessage || '대기 중...',
  }));

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

        {!connected ? (
          <Button colorScheme="green" onClick={handleEnterRoom} disabled={!myUserId}>
            참여하기
          </Button>
        ) : (
          <Button colorScheme="red" onClick={handleLeaveRoom}>
            나가기
          </Button>
        )}

        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            참가자 목록 ({participants.length}명)
          </Text>
          <ProfileList data={profileListData} />
        </Box>
      </VStack>
    </Box>
  );
};

export default WaitingRoomPageSimple;