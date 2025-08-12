// ChatRoomPage.tsx - Virtuoso 무한 스크롤 적용 버전
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

type AccessState = 'checking' | 'granted' | 'denied' | 'error';

const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  
  const { user, isReady } = useAuth();
  const myUserId = user?.id || null;

  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Virtuoso 관련 상태
  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // 채팅방 접근 권한 확인
  useEffect(() => {
    const checkAccess = async () => {
      if (!isReady || !myUserId || !chatRoomId) {
        return;
      }

      try {
        setAccessState('checking');
        const hasAccess = await getRequest<boolean>(`/chat/${chatRoomId}/is-user/${myUserId}`);
        
        if (hasAccess === true) {
          console.log('[CHAT] 채팅방 접근 권한 확인됨');
          setAccessState('granted');
        } else {
          console.warn('[CHAT] 채팅방 접근 권한 없음');
          setAccessState('denied');
        }
      } catch (error) {
        console.error('[CHAT] 접근 권한 확인 중 오류:', error);
        setAccessState('error');
      }
    };

    checkAccess();
  }, [isReady, myUserId, chatRoomId]);

  // 접근 거부시 자동 리다이렉트
  useEffect(() => {
    if (accessState === 'denied') {
      const timer = setTimeout(() => {
        navigate('/main', { replace: true });
      }, 3000);
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
    if (!myUserId) return;

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
  }, [myUserId, convertToClientMessage]);

  // 히스토리 로드 완료 처리 (이전 메시지는 맨 위에 추가)
  const handleHistoryLoaded = useCallback((history: ReceivedMessage[], hasMore: boolean) => {
    console.log('[DEBUG] 히스토리 로드됨:', history.length, '개 메시지');
    console.log('[DEBUG] 첫 번째 메시지:', history[0]);
    
    // 🔥 임시: 빈 히스토리일 때 테스트 메시지 추가
    if (history.length === 0) {
      console.log('[DEBUG] 빈 히스토리 - 테스트 메시지 추가');
      const testMessage: ReceivedMessage = {
        chattingRoomId: parseInt(chatRoomId || '0'),
        senderRoomUserId: parseInt(myUserId || '0') + 1, // 다른 사용자로 설정
        senderUserId: 999,
        content: '테스트 메시지입니다!',
        type: 'TEXT',
        sentAt: new Date().toISOString()
      };
      history = [testMessage];
    }
    
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
  }, [convertToClientMessage, firstItemIndex, chatRoomId, myUserId]);

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

  // 웹소켓 훅 사용
  const { 
    sendMessage: socketSendMessage, 
    sendPoke, 
    startCall,
    acceptCall,
    rejectCall,
    loadMoreHistory,
    connectionState, 
    isConnected 
  } = useChatSocket({
    chatRoomId: accessState === 'granted' && myUserId ? chatRoomId || '1' : null,
    myUserId: accessState === 'granted' ? myUserId : null,
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

  // 로딩 상태들
  if (!isReady || !myUserId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh" flexDirection="column" gap={4}>
        <Text fontSize="lg">사용자 정보를 불러오는 중...</Text>
      </Box>
    );
  }

  if (accessState === 'checking') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh" flexDirection="column" gap={4}>
        <Text fontSize="lg">채팅방 접근 권한을 확인 중...</Text>
      </Box>
    );
  }

  if (accessState === 'denied') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh" flexDirection="column" gap={4} bg="red.50">
        <Text fontSize="xl" fontWeight="bold" color="red.600">
          채팅방 접근 권한이 없습니다
        </Text>
        <Text color="gray.600">3초 후 메인 페이지로 이동합니다...</Text>
        <LongButton onClick={() => navigate('/main', { replace: true })}>
          지금 이동하기
        </LongButton>
      </Box>
    );
  }

  if (accessState === 'error') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh" flexDirection="column" gap={4} bg="yellow.50">
        <Text fontSize="xl" fontWeight="bold" color="orange.600">
          채팅방 접근 권한 확인 중 오류가 발생했습니다
        </Text>
        <Text color="gray.600">네트워크 연결을 확인하고 다시 시도해주세요.</Text>
        <Flex gap={2}>
          <LongButton onClick={() => window.location.reload()}>다시 시도</LongButton>
          <LongButton onClick={() => navigate('/main', { replace: true })}>메인으로 돌아가기</LongButton>
        </Flex>
      </Box>
    );
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
            마니또 ({getConnectionStatus()})
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
          itemContent={(index, msg) => (
            <Box px={4} py={2}>
              <ChatMessageRenderer 
                message={msg} 
                myUserId={myUserId}
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