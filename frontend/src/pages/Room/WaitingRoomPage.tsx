import { Box, Text, Button, VStack, Spinner, Icon, Flex, useClipboard, CloseButton } from '@chakra-ui/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, postRequest, deleteRequest } from '@/api/requests';

import { useRoomInfo } from '@/hooks/useRoomInfo';
import RoomInfoCard from '@/components/cards/RoomInfoCard';
import ProfileList from '@/components/lists/ProfileList';
import { useWaitingRoomSocket, type Participant } from '@/utils/useWaitingRoomSocket';
import { useAuth } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import MessageInputBody from '@/components/modal/MessageInputBody';
import { FaCrown } from "react-icons/fa";
import DoubleButton from '@/components/buttons/DoubleButton'

const WaitingRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, gameInfo, startGame, syncUserGameStatus } = useAuth();
  const myUserId = user?.id;
  const { connected, participants, lastMessage, connect, disconnect, updateParticipants } = useWaitingRoomSocket();
  const { openModal, closeModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [initialParticipants, setInitialParticipants] = useState<Participant[]>([]);
  const connectingRef = useRef(false);
  const { roomInfo } = useRoomInfo(roomId);
  const isCreator = String(myUserId) === String(roomInfo?.creatorId);
  const inviteUrl = `${window.location.origin}/room/${roomId}`;
  const clipboard = useClipboard({ value: inviteUrl });

  const hasMe = useMemo(() => {
    if (!myUserId) return false;
    return initialParticipants.some((p) => String(p.userId) === String(myUserId));
  }, [initialParticipants, myUserId]);

  useEffect(() => {
    const initialize = async () => {
      if (!roomId || !myUserId) {
        navigate('/main');
        return;
      }
      setIsLoading(true);

      try {
        const currentParticipants = await getRequest<Participant[]>(`/room/${roomId}/participants`);
        const isAlreadyParticipant = currentParticipants.some(p => String(p.userId) === String(myUserId));

        if (isAlreadyParticipant) {
          setInitialParticipants(currentParticipants);
        } else {
          if (gameInfo.status !== 'IN_NONE') {
            openModal({
              title: '입장 불가',
              body: <Text>이미 다른 방에 참여 중입니다.</Text>,
              footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
            });
            return;
          }

          const info = await getRequest<{ status: string }>(`/room/${roomId}`);
          if (info.status !== 'NOT_STARTED') {
            openModal({
              title: '입장 불가',
              body: <Text>이미 시작했거나 종료된 방입니다.</Text>,
              footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
            });
            return;
          }

          setInitialParticipants(currentParticipants);
        }
      } catch {
        openModal({
          title: '오류 발생',
          body: <Text>방 정보를 확인하는 중 오류가 발생했습니다.</Text>,
          footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    return () => { void disconnect(); };
  }, [roomId, myUserId, gameInfo.status, openModal, closeModal, navigate, disconnect]);

  useEffect(() => {
    if (!roomId) return;
    if (hasMe && !connected && !connectingRef.current) {
      connectingRef.current = true;
      connect(roomId, initialParticipants);
      setTimeout(() => (connectingRef.current = false), 0);
    }
  }, [roomId, hasMe, connected, initialParticipants, connect]);

  useEffect(() => {
    if (!lastMessage || !roomId) return;

    const refreshParticipants = async () => {
      try {
        const updatedList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
        setInitialParticipants(updatedList);
        if (connected) updateParticipants(updatedList);
      } catch {
        // 실패 시 무시
      }
    };

    switch (lastMessage.type) {
      case 'ENTER': {
        refreshParticipants();
        break;
      }
      case 'EXIT': {
        break;
      }
      case 'KICK': {
        const messageUserId = String(lastMessage.userId);
        const isMe = messageUserId === String(myUserId);
        if (isMe) {
          alert('방장에 의해 대기방에서 내보내졌습니다.');
          disconnect();
          navigate('/');
        }
        break;
      }
      case 'CLOSE': {
        alert('방장이 대기방을 닫았습니다.');
        disconnect();
        navigate('/');
        break;
      }
      case 'START': {
        disconnect();
        openModal({
          title: '게임 시작!',
          body: '🎯 게임이 시작됩니다! 잠시만 기다려주세요!',
          footer: null,
        });
        setTimeout(() => {
          closeModal();
          syncUserGameStatus();
        }, 1500);
        break;
      }
    }
  }, [lastMessage, myUserId, disconnect, navigate, roomId, connected, updateParticipants, openModal, closeModal, syncUserGameStatus]);

  const handleJoin = () => {
    if (!roomId || !myUserId) return;
    const joinWithMessage = async (message: string) => {
      try {
        await postRequest(`/room/${roomId}/message`, { message });
        closeModal();
        const newList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
        setInitialParticipants(newList);
        await syncUserGameStatus();
        connect(roomId, newList);
      } catch {
        alert('참여 요청에 실패했습니다.');
      }
    };

    openModal({
      title: '대기방 참여',
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
      setInitialParticipants(prev =>
        prev.filter(p => String(p.userId) !== String(myUserId))
      );
      if (connected) await disconnect();
      const updatedList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
      setInitialParticipants(updatedList);
      await syncUserGameStatus();
    } catch {
      alert('나가기 요청에 실패했습니다.');
    }
  };

  const confirmKickUser = async (userId: string | number) => {
    try {
      await deleteRequest(`/room/${roomId}/participants/${userId}`);
      closeModal();
    } catch {
      closeModal();
      alert('참가자 내보내기에 실패했습니다.');
    }
  };

  const handleKickUser = (userId: string | number) => {
    openModal({
      title: "참가자 내보내기",
      body: `User ID: ${userId}를 대기방에서 내보내시겠습니까?`,
      footer: (
        <DoubleButton
          leftLabel="취소"
          rightLabel="내보내기"
          onLeftClick={closeModal}
          onRightClick={() => confirmKickUser(userId)}
          rightProps={{ colorScheme: "red" }}
        />
      )
    });
  };

  const handleInvite = () => {
    clipboard.copy();
    alert("초대 링크가 복사되었습니다!");
  };

  const handleStart = async () => {
    if (!roomId) return;
    try {
      await startGame(parseInt(roomId));
      await syncUserGameStatus();
      openModal({
        title: '게임 시작!',
        body: '🎯 게임이 시작됩니다! 잠시만 기다려주세요!',
        footer: null,
      });
      setTimeout(() => {
        closeModal();
        navigate('/home');
      }, 1500);
    } catch {
      alert('게임 시작에 실패했습니다.');
    }
  };

  // 대기방 삭제
  const confirmDeleteRoom = async () => {
    try {
      await postRequest(`/room/exit`);
      closeModal();
      navigate('/');
    } catch {
      alert('대기방 삭제에 실패했습니다.');
    }
  };

  const handleDeleteRoom = () => {
    openModal({
      title: "대기방 삭제",
      body: "정말로 대기방을 삭제하시겠습니까?\n 복구할 수 없습니다.",
      footer: (
        <DoubleButton
          leftLabel="취소"
          rightLabel="삭제"
          onLeftClick={closeModal}
          onRightClick={confirmDeleteRoom}
          rightProps={{ colorScheme: "red" }}
        />
      )
    });
  };

  const listForRender = connected ? participants : initialParticipants;

  const getRightButtonProps = (participantCount: number) => {
    if (isCreator) {
      return {
        label: '시작하기',
        onClick: handleStart,
        props: { colorScheme: 'blue', disabled: participantCount < 4 }
      };
    }
    if (hasMe) {
      return {
        label: '나가기',
        onClick: handleLeave,
        props: { colorScheme: 'red' }
      };
    }
    return {
      label: '참여하기',
      onClick: handleJoin,
      props: { colorScheme: 'green', disabled: !myUserId }
    };
  };

  const rightButton = getRightButtonProps(listForRender.length);

  const profileListData = listForRender.map((p) => {
    let rightContent = null;
    if (String(p.userId) === String(roomInfo?.creatorId)) {
      rightContent = <Icon as={FaCrown} color="yellow.500" mx={2} w={5} h={5} />;
    } else if (isCreator && String(p.userId) !== String(myUserId)) {
      rightContent = (
        <CloseButton
          size="sm"
          variant="ghost"
          colorPalette="red"
          onClick={() => handleKickUser(p.userId)}
          aria-label={`User ${p.userId} 내보내기`}
        />
      );
    }
    const isMe = String(p.userId) === String(myUserId);
    return {
      name: p.name || `User ${p.userId}`,
      statusMessage: p.statusMessage || '방장입니다.',
      rightSideChild: rightContent,
      borderWidth: isMe ? "2px" : "1px",
      borderColor: isMe ? "accent.500" : "gray.200",
    };
  });

  const actionButton = (
    <DoubleButton
      leftLabel="초대하기"
      rightLabel={rightButton.label}
      onLeftClick={handleInvite}
      onRightClick={rightButton.onClick}
      rightProps={rightButton.props}
    />
  );

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

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box flex="1" overflowY="auto" p={4}>
        <RoomInfoCard roomInfo={roomInfo} />
        <VStack gap={4} align="stretch" bg="transparent">
          <Box>
            <Flex justify="space-between" py={3}>
              <Text fontSize="lg" fontWeight="semibold">
                참가자 목록 ({listForRender.length}명)
              </Text>
              {isCreator && (
                <Button
                  variant="ghost"
                  color="red.500"
                  fontSize="sm"
                  fontWeight="medium"
                  onClick={handleDeleteRoom}
                  _hover={{ bg: "red.50" }}
                  px={2}
                  py={1}
                  h="auto"
                  minH="auto"
                >
                  대기방 삭제하기
                </Button>
              )}
            </Flex>
          </Box>

          <Box>
            <ProfileList data={profileListData} />
          </Box>
        </VStack>
      </Box>

      <Box as="footer" position="sticky" bottom="0" px={4} py={4} bg="transparent" zIndex={1000}>
        {actionButton}
      </Box>
    </Box>
  );
};

export default WaitingRoomPage;
