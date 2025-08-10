// src/pages/Room/WaitingRoomPage.tsx
import { Box, Text, Button, VStack, Spinner } from '@chakra-ui/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, postRequest, deleteRequest } from '@/api/requests';

import { useRoomInfo, type RoomInfo } from '@/hooks/useRoomInfo';
import RoomInfoCard from '@/components/cards/RoomInfoCard';
import ProfileList from '@/components/lists/ProfileList';
import { useWaitingRoomSocket, type Participant } from '@/utils/useWaitingRoomSocket';
import { useAuth } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import MessageInputBody from '@/components/modal/MessageInputBody';
const WaitingRoomPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const myUserId = useAuth((s) => s.user?.id);
    const { connected, participants, connect, disconnect } = useWaitingRoomSocket();
    const { openModal, closeModal } = useModalStore();
    const [isLoading, setIsLoading] = useState(true);
    const [initialParticipants, setInitialParticipants] = useState<Participant[]>([]);
    const connectingRef = useRef(false);
    const { roomInfo, isLoading: isRoomInfoLoading } = useRoomInfo(roomId);

    // --- 페이지 진입 시 실행되는 메인 로직 ---
    useEffect(() => {
        const initialize = async () => {
            if (!roomId || !myUserId) {
                navigate('/main');
                return;
            }
            setIsLoading(true);

            try {
                // --- 0단계: 내가 이미 참여 중인지 먼저 확인! ---
                const currentParticipants = await getRequest<Participant[]>(`/room/${roomId}/participants`);
                const isAlreadyParticipant = currentParticipants.some(p => String(p.userId) === String(myUserId));

                if (isAlreadyParticipant) {
                    // ✅ 이미 참여 중인 경우: 모든 검증을 건너뛰고 바로 연결 준비
                    console.log('이미 참여 중인 사용자입니다. 바로 연결합니다.');
                    setInitialParticipants(currentParticipants);
                } else {
                    // ❌ 참여 중이 아닌 신규 유저인 경우: 자격 검증 시작
                    console.log('신규 사용자입니다. 자격 검증을 시작합니다.');

                    // 1단계: 내 상태 확인
                    const userStatus = await getRequest<string>('/room/check');
                    if (userStatus !== 'IN_NONE') {
                        openModal({
                            title: '입장 불가', body: <Text>이미 다른 방에 참여 중입니다.</Text>,
                            footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                        });
                        return; // 여기서 로직 종료
                    }

                    // 2단계: 방 상태 확인
                    const roomInfo = await getRequest<{ status: string }>(`/room/${roomId}`);
                    if (roomInfo.status !== 'NOT_STARTED') {
                        openModal({
                            title: '입장 불가', body: <Text>이미 시작했거나 종료된 방입니다.</Text>,
                            footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                        });
                        return; // 여기서 로직 종료
                    }
                    
                    // 모든 검증 통과! '참여하기' 버튼을 누를 수 있도록 참가자 목록을 설정합니다.
                    setInitialParticipants(currentParticipants);
                }
            } catch (error) {
                console.error("대기방 진입 검증 실패:", error);
                openModal({
                    title: '오류 발생', body: <Text>방 정보를 확인하는 중 오류가 발생했습니다.</Text>,
                    footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                });
            } finally {
                setIsLoading(false);
            }
        };

        initialize();

        return () => { void disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, myUserId]);


    const hasMe = useMemo(() => {
        if (!myUserId) return false;
        return initialParticipants.some((p) => String(p.userId) === String(myUserId));
    }, [initialParticipants, myUserId]);

    // 내가 참가자 목록에 있을 때만 자동 연결
    useEffect(() => {
        if (!roomId) return;
        if (hasMe && !connected && !connectingRef.current) {
            connectingRef.current = true;
            connect(roomId, initialParticipants);
            setTimeout(() => (connectingRef.current = false), 0);
        }
    }, [roomId, hasMe, connected, initialParticipants, connect]);


    const handleJoin = () => {
        if (!roomId || !myUserId) return;
        
        // 입력받은 메시지로 참가 요청을 보내는 실제 로직
        const joinWithMessage = async (message: string) => {
            try {
                await postRequest(`/room/${roomId}/message`, { message });
                closeModal();
                const newList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
                setInitialParticipants(newList);
                connect(roomId, newList);
            } catch (e) {
                console.error('참여 실패:', e);
                alert('참여 요청에 실패했습니다.');
            }
        };

        openModal({
            title: '대기방 참여',
            // 👇 body에 분리된 컴포넌트를 렌더링합니다.
            caption: '상태 메세지를 적어주세요!',
            body: (
                <MessageInputBody
                    onSubmit={joinWithMessage}
                    onClose={closeModal}
                />
            ),
            footer: '',
        });
    };


    const handleLeave = async () => {
        if (!roomId || !myUserId) return;
        try {
            await deleteRequest(`/room/${roomId}/exit`);
            // 내 연결만 종료합니다.
            setInitialParticipants(prev =>
                prev.filter(p => String(p.userId) !== String(myUserId))
            );
            if (connected) {
                await disconnect();
            }
            const updatedList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
            setInitialParticipants(updatedList);

        } catch (e) {
            console.error('나가기 실패:', e);
            alert('나가기 요청에 실패했습니다.');
        }
    };

  // 리스트 소스: 연결됐으면 소켓의 participants, 아니면 초기 조회 리스트
  const listForRender = connected ? participants : initialParticipants;
  const profileListData = listForRender.map((p) => ({
    name: `User ID: ${p.userId}`,
    statusMessage: p.statusMessage || '상태메세지를 설정해주세요!',
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
      <RoomInfoCard roomInfo={roomInfo} />
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

export default WaitingRoomPage;
