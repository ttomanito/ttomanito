// ChatRoomPage.tsx - roomUserId 조회 추가
import { Box, Flex, Icon, Text, Image, Spinner, Center } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import TextInput from '@/components/inputs/TextInput';
import { useState, useCallback, useRef, useEffect } from 'react';
import LongButton from '@/components/buttons/LongButton';
import type { Message as ChatMessage, ReceivedMessage } from '@/types/chat/chat';
import ChatMessageRenderer from '@/components/chat/ChatMessageRenderer';
import poke_icon from '@/assets/poke_icon.svg';
import { useChatSocket } from '@/utils/useChatSocket';
import { useAuth } from '@/stores/authStore';
import { getRequest } from '@/api/requests';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import CommonCard from '@/components/cards/CommonCard';
import { TbShieldX } from 'react-icons/tb'

// API 응답 타입 정의
interface RoomUserResponse {
  roomUserId: number;
}

type AccessState = 'checking' | 'granted' | 'denied' | 'error';

// 접근 제어 카드 UI
const AccessCardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Center minH="100vh" bg="gray.50" px={4}>
    <CommonCard maxW="520px" w="full" textAlign="center" py={16}>
      {children}
    </CommonCard>
  </Center>
);

const AccessCheckingCard = ({ text }: { text: string }) => (
  <AccessCardLayout>
    <Box mb={6}>
      <Spinner size="lg" />
    </Box>
    <Text fontSize="xl" fontWeight="bold" mb={2}>{text}</Text>
    <Text color="gray.500">잠시만 기다려 주세요…</Text>
  </AccessCardLayout>
);

const AccessDeniedCard = ({ onGoMain }: { onGoMain: () => void }) => (
  <AccessCardLayout>
    {/* 아이콘 배지 */}
    <Center mb={6}>
      <Box
        w="64px"
        h="64px"
        borderRadius="full"
        bg="red.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={TbShieldX} color="red.500" boxSize={7} />
      </Box>
    </Center>
    {/* 제목/설명 */}
    <Text fontSize="2xl" fontWeight="extrabold" mb={2}>
      접근이 제한되었습니다
    </Text>
    <Text color="gray.500" mb={8}>
      이 채팅방에 접근할 권한이 없습니다.
    </Text>
    {/* 액션 */}
    <LongButton onClick={onGoMain}>메인으로 이동</LongButton>
  </AccessCardLayout>
);

const AccessErrorCard = ({ onRetry, onGoMain }: { onRetry: () => void; onGoMain: () => void }) => (
  <AccessCardLayout>
    <Center mb={6}>
      <Box
        w="64px"
        h="64px"
        borderRadius="full"
        bg="orange.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={TbShieldX} color="orange.500" boxSize={7} />
      </Box>
    </Center>
    <Text fontSize="xl" fontWeight="bold" mb={2}>
      접근 권한 확인 중 오류가 발생했어요
    </Text>
    <Text color="gray.500" mb={8}>
      네트워크 연결을 확인한 뒤 다시 시도해 주세요.
    </Text>
    <Flex gap={2} justify="center">
      <LongButton onClick={onRetry}>다시 시도</LongButton>
      <LongButton onClick={onGoMain}>메인으로</LongButton>
    </Flex>
  </AccessCardLayout>
);

const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  
  const { user, isReady } = useAuth();
  const myUserId = user?.id || null;

  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [roomUserId, setRoomUserId] = useState<string | null>(null); // 👈 roomUserId 상태 추가
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Virtuoso 관련 상태
  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // 채팅방 접근 권한 확인 및 roomUserId 조회
  useEffect(() => {
    const checkAccessAndGetRoomUserId = async () => {
      if (!isReady || !myUserId || !chatRoomId) {
        return;
      }

      try {
        setAccessState('checking');
        
        // 1. 채팅방 접근 권한 확인
        const hasAccess = await getRequest<boolean>(`/chat/${chatRoomId}/is-user/${myUserId}`);
        
        if (hasAccess === true) {
          console.log('[CHAT] 채팅방 접근 권한 확인됨');
          
          // 2. roomUserId 조회
          const roomUserData = await getRequest<RoomUserResponse>(`/room-user/me/active`);
          console.log('[CHAT] roomUserId 조회 결과:', roomUserData);
          
          setRoomUserId(roomUserData.roomUserId.toString());
          setAccessState('granted');
        } else {
          console.warn('[CHAT] 채팅방 접근 권한 없음');
          setAccessState('denied');
        }
      } catch (error) {
        console.error('[CHAT] 접근 권한 확인 또는 roomUserId 조회 중 오류:', error);
        setAccessState('error');
      }
    };

    checkAccessAndGetRoomUserId();
  }, [isReady, myUserId, chatRoomId]);

  // 접근 거부시 자동 리다이렉트
  useEffect(() => {
    if (accessState === 'denied') {
      const timer = setTimeout(() => {
        navigate('/main', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [accessState, navigate]);

  // 백엔드 메시지를 클라이언트 Message 타입으로 변환
  const convertToClientMessage = useCallback((receivedMessage: ReceivedMessage): ChatMessage => {
    const sentAt = new Date(receivedMessage.sentAt);
    
    return {
      id: `${receivedMessage.senderRoomUserId}-${receivedMessage.sentAt}`,
      sender: String(receivedMessage.senderRoomUserId),
      content: receivedMessage.content || '',
      time: sentAt.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: receivedMessage.type === 'TEXT' ? 'text' 
           : receivedMessage.type === 'POKE' ? 'poke'
           : receivedMessage.type === 'CALL_START' ? 'call_start'
           : receivedMessage.type === 'CALL_ACCEPT' ? 'call_accept'
           : 'call_reject',
      originalSentAt: receivedMessage.sentAt,
      originalType: receivedMessage.type,
    };
  }, []);

  // 실시간 메시지 처리 (새 메시지는 맨 아래 추가)
  const handleNewMessage = useCallback((receivedMessage: ReceivedMessage) => {
    console.log('[DEBUG] 새 메시지 수신:', receivedMessage);
    if (!roomUserId) return; // 👈 roomUserId로 변경

    const newMessage = convertToClientMessage(receivedMessage);
    console.log('[DEBUG] 변환된 메시지:', newMessage);
    
    setMessages(prevMessages => {
      console.log('[DEBUG] 이전 메시지 개수:', prevMessages.length);
      const updatedMessages = [...prevMessages, newMessage];
      console.log('[DEBUG] 업데이트된 메시지 개수:', updatedMessages.length);
      
      // 새 메시지가 추가되면 스크롤을 맨 아래로
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: updatedMessages.length - 1,
          behavior: 'smooth'
        });
      }, 100);
      
      return updatedMessages;
    });
  }, [roomUserId, convertToClientMessage]); // 👈 roomUserId로 변경

  // 히스토리 로드 완료 처리 (이전 메시지는 맨 위에 추가)
  const handleHistoryLoaded = useCallback((history: ReceivedMessage[], hasMore: boolean) => {
    console.log('[DEBUG] 히스토리 로드됨:', history.length, '개 메시지');
    console.log('[DEBUG] 첫 번째 메시지:', history[0]);
    
    const convertedHistory = history.map(convertToClientMessage);
    
    setMessages(prevMessages => {
      if (prevMessages.length === 0) {
        console.log('[DEBUG] 첫 로드 - 총', convertedHistory.length, '개 메시지 설정');
        // 첫 로드: 메시지 설정 후 맨 아래로 스크롤
        setTimeout(() => {
          if (convertedHistory.length > 0) {
            virtuosoRef.current?.scrollToIndex({
              index: convertedHistory.length - 1,
              behavior: 'auto'
            });
          }
        }, 100);
        
        return convertedHistory;
      } else {
        // 이전 메시지 로드: 맨 위에 추가하고 firstItemIndex 업데이트
        const newFirstItemIndex = Math.max(0, firstItemIndex - convertedHistory.length);
        setFirstItemIndex(newFirstItemIndex);
        
        return [...convertedHistory, ...prevMessages];
      }
    });
    
    setHasMoreHistory(hasMore);
    setIsLoadingHistory(false);
  }, [convertToClientMessage, firstItemIndex, chatRoomId, roomUserId]); // 👈 roomUserId 추가

  // 연결 상태 변경 처리
  const handleConnectionStateChange = useCallback((state: any) => {
    if (state === 'failed') {
      setLastError('채팅 서버 연결이 끊어졌습니다');
    } else if (state === 'connected') {
      setLastError(null);
    }
  }, []);

  // 무한 스크롤 - 맨 위에 도달했을 때 이전 메시지 로드
  const handleStartReached = useCallback(() => {
    if (hasMoreHistory && !isLoadingHistory && messages.length > 0) {
      setIsLoadingHistory(true);
      const oldestMessage = messages[0];
      if (oldestMessage.originalSentAt) {
        loadMoreHistory(oldestMessage.originalSentAt);
      }
    }
  }, [hasMoreHistory, isLoadingHistory, messages]);

  // 웹소켓 훅 사용 - roomUserId 전달
  const { 
    sendMessage: socketSendMessage, 
    sendPoke, 
    acceptCall,
    rejectCall,
    loadMoreHistory,
    connectionState, 
    isConnected 
  } = useChatSocket({
    chatRoomId: accessState === 'granted' && roomUserId ? chatRoomId || '1' : null,
    roomUserId: roomUserId, // 👈 명확하게 roomUserId로 전달
    onMessage: handleNewMessage,
    onHistoryLoaded: handleHistoryLoaded,
    onConnectionStateChange: handleConnectionStateChange,
  });

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      const success = await socketSendMessage(message);
      if (success) {
        setMessage('');
        setLastError(null);
      } else {
        setLastError('메시지 전송에 실패했습니다');
      }
    }
  };

  // 찌르기
  const handlePoke = async () => {
    if (isConnected) {
      const success = await sendPoke();
      if (!success) {
        setLastError('찌르기 전송에 실패했습니다');
      }
    }
  };

  // 로딩 상태 별 화면 (CommonCard 활용)
  if (!isReady || !myUserId) {
    return <AccessCheckingCard text="사용자 정보를 불러오는 중" />;
  }

  if (accessState === 'checking') {
    return <AccessCheckingCard text="채팅방 접근 권한을 확인 중" />;
  }

  if (accessState === 'denied') {
    return <AccessDeniedCard onGoMain={() => navigate('/main', { replace: true })} />;
  }

  if (accessState === 'error') {
    return (
      <AccessErrorCard
        onRetry={() => window.location.reload()}
        onGoMain={() => navigate('/main', { replace: true })}
      />
    );
  }

  // roomUserId가 없으면 로딩 상태 표시 
  if (!roomUserId) {
    return <AccessCheckingCard text="채팅방 정보를 불러오는 중" />;
  }

  // 연결 상태 표시
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected': return '✅ 연결됨';
      case 'connecting': return '🔄 연결 중...';
      case 'reconnecting': return '🔄 재연결 중...';
      case 'failed': return '❌ 연결 실패';
      default: return '❌ 연결 안됨';
    }
  };

  // 정상적인 채팅방 UI
  return (
    <Box position="relative" h="100vh" display="flex" flexDirection="column">
      {/* 상단 헤더 */}
      <Box as="header" position="sticky" top="0" zIndex="10" bg="white" borderBottom="1px solid #ccc" p={4}>
        <Flex align="center" justify="space-between">
          <Text fontWeight="bold" fontSize="lg" textAlign="center" flex="1">
            마니또 ({getConnectionStatus()}) | roomUserId: {roomUserId} | roomId : {chatRoomId}
          </Text>
          <Icon as={FiPhone} boxSize={5} />
        </Flex>
      </Box>

      {/* 연결 상태 및 에러 알림 바 */}
      {(connectionState !== 'connected' || lastError) && (
        <Box 
          bg={lastError ? 'red.100' : connectionState === 'failed' ? 'red.100' : 'yellow.100'} 
          p={2} 
          textAlign="center"
        >
          <Text 
            color={lastError ? 'red.600' : connectionState === 'failed' ? 'red.600' : 'orange.600'} 
            fontSize="sm"
          >
            {lastError || (
              connectionState === 'failed' 
                ? '채팅 서버 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.' 
                : '채팅 서버에 연결 중입니다...'
            )}
          </Text>
          {lastError && (
            <Text 
              color="red.500" 
              fontSize="xs" 
              mt={1}
              cursor="pointer"
              onClick={() => setLastError(null)}
              textDecoration="underline"
            >
              닫기
            </Text>
          )}
        </Box>
      )}

      {/* Virtuoso 무한 스크롤 메시지 목록 */}
      <Box flex="1" overflowY="auto">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: '100%' }}
          data={messages}
          firstItemIndex={firstItemIndex}
          startReached={hasMoreHistory ? handleStartReached : undefined}
          itemContent={(_, msg) => (
            <Box px={4} py={2}>
              <ChatMessageRenderer 
                message={msg} 
                myUserId={roomUserId} // 👈 roomUserId로 변경
                onCallAccept={acceptCall}
                onCallReject={rejectCall}
              />
            </Box>
          )}
          components={{
            Header: () => (
              <Center p={4}>
                {isLoadingHistory && hasMoreHistory && (
                  <>
                    <Spinner size="sm" mr={2} />
                    <Text fontSize="sm" color="gray.600">이전 메시지 불러오는 중...</Text>
                  </>
                )}
              </Center>
            ),
          }}
        />
      </Box>

      {/* 입력창 */}
      <Box as="footer" position="sticky" bottom="0" bg="white" borderTop="1px solid #ccc" zIndex="10">
        <Flex as="form" onSubmit={handleSendMessage} p={2} gap={1}>
          <LongButton 
            w="10" 
            h="10" 
            p="0" 
            bg="white" 
            type="button" 
            onClick={handlePoke}
            disabled={!isConnected}
          >
            <Image src={poke_icon} w={10} />
          </LongButton>
          <TextInput
            h="40px"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "메시지를 입력하세요" : "연결 중..."}
            disabled={!isConnected}
          />
          <LongButton 
            w="13" 
            h="10" 
            type="submit" 
            disabled={!isConnected || !message.trim()}
          >
            {lastError ? '재시도' : '보내기'}
          </LongButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatRoomPage;