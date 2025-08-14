// ChatRoomPage.tsx (수정본)
import { Box, Flex, Icon, Text, Image, Spinner, Center } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { TbShieldX } from 'react-icons/tb';
import profile_manito from '@/assets/ttomas/profile_manito.png';
import profile_manitee from '@/assets/ttomas/profile_manitee.png';

// ---------- 타입 ----------
interface RoomUserResponse { roomUserId: number; }

type Partner = {
  role: '마니또' | '마니띠' | '대화상대';
  profileImage?: string;
  name?: string;
};

type Participant = {
  userId?: number;
  roomUserId?: number;
  role?: 'MANITO' | 'MANITEE' | string;
  nickname?: string;
  avatar?: string;
};

type AccessState = 'checking' | 'granted' | 'denied' | 'error';

// ---------- 유틸 ----------
const toKoreanRole = (raw?: string): Partner['role'] => {
  if (!raw) return '대화상대';
  const upper = raw.toUpperCase();
  if (upper.includes('MANITO')) return '마니또';
  if (upper.includes('MANITEE')) return '마니띠';
  return '대화상대';
};
const defaultImageByRole = (role: Partner['role']) =>
  role === '마니또' ? profile_manito : role === '마니띠' ? profile_manitee : undefined;

// ---------- 접근 제어 카드 UI ----------
const AccessCardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Center minH="100vh" bg="gray.50" px={4}>
    <CommonCard maxW="520px" w="full" textAlign="center" py={16}>
      {children}
    </CommonCard>
  </Center>
);

const AccessCheckingCard = ({ text }: { text: string }) => (
  <AccessCardLayout>
    <Box mb={6}><Spinner size="lg" /></Box>
    <Text fontSize="xl" fontWeight="bold" mb={2}>{text}</Text>
    <Text color="gray.500">잠시만 기다려 주세요…</Text>
  </AccessCardLayout>
);

const AccessDeniedCard = ({ onGoMain }: { onGoMain: () => void }) => (
  <AccessCardLayout>
    <Center mb={6}>
      <Box w="64px" h="64px" borderRadius="full" bg="red.50" display="flex" alignItems="center" justifyContent="center">
        <Icon as={TbShieldX} color="red.500" boxSize={7} />
      </Box>
    </Center>
    <Text fontSize="2xl" fontWeight="extrabold" mb={2}>접근이 제한되었습니다</Text>
    <Text color="gray.500" mb={8}>이 채팅방에 접근할 권한이 없습니다.</Text>
    <LongButton onClick={onGoMain}>메인으로 이동</LongButton>
  </AccessCardLayout>
);

const AccessErrorCard = ({ onRetry, onGoMain }: { onRetry: () => void; onGoMain: () => void }) => (
  <AccessCardLayout>
    <Center mb={6}>
      <Box w="64px" h="64px" borderRadius="full" bg="orange.50" display="flex" alignItems="center" justifyContent="center">
        <Icon as={TbShieldX} color="orange.500" boxSize={7} />
      </Box>
    </Center>
    <Text fontSize="xl" fontWeight="bold" mb={2}>접근 권한 확인 중 오류가 발생했어요</Text>
    <Text color="gray.500" mb={8}>네트워크 연결을 확인한 뒤 다시 시도해 주세요.</Text>
    <Flex gap={2} justify="center">
      <LongButton onClick={onRetry}>다시 시도</LongButton>
      <LongButton onClick={onGoMain}>메인으로</LongButton>
    </Flex>
  </AccessCardLayout>
);

// ---------- 메인 컴포넌트 ----------
const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isReady } = useAuth();
  const myUserId = user?.id || null;

  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [roomUserId, setRoomUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Partner | null>(
    ((location.state as any)?.partner as Partner | undefined) ?? null
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // 접근 권한 + 내 roomUserId
  useEffect(() => {
    const checkAccessAndGetRoomUserId = async () => {
      if (!isReady || !myUserId || !chatRoomId) return;
      try {
        setAccessState('checking');
        const hasAccess = await getRequest<boolean>(`/chat/${chatRoomId}/is-user/${myUserId}`);
        if (hasAccess === true) {
          const roomUserData = await getRequest<RoomUserResponse>(`/room-user/me/active`);
          setRoomUserId(roomUserData.roomUserId.toString());
          setAccessState('granted');
        } else {
          setAccessState('denied');
        }
      } catch (e) {
        console.error('[CHAT] 접근 권한/roomUserId 오류:', e);
        setAccessState('error');
      }
    };
    checkAccessAndGetRoomUserId();
  }, [isReady, myUserId, chatRoomId]);

  // 거부 시 자동 이동
  useEffect(() => {
    if (accessState === 'denied') {
      const t = setTimeout(() => navigate('/main', { replace: true }), 2000);
      return () => clearTimeout(t);
    }
  }, [accessState, navigate]);

  // partner 없을 때만 API 호출
  useEffect(() => {
    if (accessState !== 'granted' || !chatRoomId || !roomUserId || partner) return;
    const fetchPartner = async () => {
      try {
        const res = await getRequest<{ participants: Participant[] }>(`/chat/${chatRoomId}/participants`);
        const list = res?.participants ?? [];
        const other =
          list.find(p => String(p.roomUserId ?? '') !== String(roomUserId)) ??
          list.find(p => String(p.userId ?? '') !== String(myUserId ?? ''));
        if (!other) return;
        const role = toKoreanRole(other.role);
        const profileImage = other.avatar || defaultImageByRole(role);
        setPartner({ role, profileImage, name: other.nickname });
      } catch (e) {
        console.warn('[CHAT] 상대 정보 조회 실패:', e);
        if (!partner) setPartner({ role: '대화상대' });
      }
    };
    fetchPartner();
  }, [accessState, chatRoomId, roomUserId, myUserId, partner]);

  // 메시지 변환
  const convertToClientMessage = useCallback((m: ReceivedMessage): ChatMessage => {
    const sentAt = new Date(m.sentAt);
    return {
      id: `${m.senderRoomUserId}-${m.sentAt}`,
      sender: String(m.senderRoomUserId),
      content: m.content || '',
      time: sentAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type:
        m.type === 'TEXT'
          ? 'text'
          : m.type === 'POKE'
          ? 'poke'
          : m.type === 'CALL_START'
          ? 'call_start'
          : m.type === 'CALL_ACCEPT'
          ? 'call_accept'
          : 'call_reject',
      originalSentAt: m.sentAt,
      originalType: m.type,
    };
  }, []);

  // 새 메시지
  const handleNewMessage = useCallback(
  (rm: ReceivedMessage) => {
    if (!roomUserId) return;
    const nm = convertToClientMessage(rm);

    // setMessages의 함수형 업데이트를 사용합니다.
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, nm];

      // 상태 업데이트 후, 스크롤을 강제로 실행합니다.
      // setTimeout을 이용해 React가 새 메시지를 렌더링할 시간을 줍니다.
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: newMessages.length - 1, // 새로 추가된 마지막 메시지로 이동
          align: 'end',
          behavior: 'smooth', // 새 메시지는 부드럽게 스크롤되도록 설정
        });
      }, 50); // 렌더링을 보장하기 위한 최소한의 지연

      return newMessages;
    });
  },
  [roomUserId, convertToClientMessage] // 의존성 배열은 그대로 둡니다.
);

  // 히스토리 로드
  const handleHistoryLoaded = useCallback(
    (history: ReceivedMessage[], hasMore: boolean) => {
      const converted = history.map(convertToClientMessage);
      setMessages(prev => {
        if (prev.length === 0) {
          return converted;
        }
        const newFirst = Math.max(0, firstItemIndex - converted.length);
        setFirstItemIndex(newFirst);
        return [...converted, ...prev];
      });
      setHasMoreHistory(hasMore);
      setIsLoadingHistory(false);
    },
    [convertToClientMessage, firstItemIndex]
  );

  const handleConnectionStateChange = useCallback((state: any) => {
    if (state === 'failed') setLastError('채팅 서버 연결이 끊어졌습니다');
    else if (state === 'connected') setLastError(null);
  }, []);

  const handleStartReached = useCallback(() => {
    if (hasMoreHistory && !isLoadingHistory && messages.length > 0) {
      setIsLoadingHistory(true);
      const oldest = messages[0];
      if (oldest.originalSentAt) loadMoreHistory(oldest.originalSentAt);
    }
  }, [hasMoreHistory, isLoadingHistory, messages]);

  // 소켓 훅
  const {
    sendMessage: socketSendMessage,
    sendPoke,
    acceptCall,
    rejectCall,
    loadMoreHistory,
    connectionState,
    isConnected,
  } = useChatSocket({
    chatRoomId: accessState === 'granted' && roomUserId ? chatRoomId || '1' : null,
    roomUserId,
    onMessage: handleNewMessage,
    onHistoryLoaded: handleHistoryLoaded,
    onConnectionStateChange: handleConnectionStateChange,
  });

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;
    const ok = await socketSendMessage(message);
    if (ok) { setMessage(''); setLastError(null); }
    else setLastError('메시지 전송에 실패했습니다');
  };
  const handlePoke = async () => {
    if (!isConnected) return;
    const ok = await sendPoke();
    if (!ok) setLastError('찌르기 전송에 실패했습니다');
  };

  // ----- [추가] messages 변경 시 자동 하단 스크롤 -----
  useEffect(() => {
    if (messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'auto',
      });
    }
  }, [messages]);

  // 상태별 화면
  if (!isReady || !myUserId) return <AccessCheckingCard text="사용자 정보를 불러오는 중" />;
  if (accessState === 'checking') return <AccessCheckingCard text="채팅방 접근 권한을 확인 중" />;
  if (accessState === 'denied') return <AccessDeniedCard onGoMain={() => navigate('/main', { replace: true })} />;
  if (accessState === 'error')
    return <AccessErrorCard onRetry={() => window.location.reload()} onGoMain={() => navigate('/main', { replace: true })} />;
  if (!roomUserId) return <AccessCheckingCard text="채팅방 정보를 불러오는 중" />;

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected': return '✅ 연결됨';
      case 'connecting': return '🔄 연결 중...';
      case 'reconnecting': return '🔄 재연결 중...';
      case 'failed': return '❌ 연결 실패';
      default: return '❌ 연결 안됨';
    }
  };

  const headerLabel =
    partner?.role === '마니띠'
      ? `마니띠 (${partner?.name ?? ''})`
      : partner?.role ?? '대화상대';

  return (
    <Box position="relative" h="100vh" display="flex" flexDirection="column">
      {/* 헤더 */}
      <Box as="header" position="sticky" top="0" zIndex="10" bg="white" borderBottom="1px solid #ccc" p={4}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3} flex="1" justify="center">
            {partner?.profileImage && (
              <Image src={partner.profileImage} alt={partner.role} boxSize="28px" borderRadius="full" />
            )}
            <Text fontWeight="bold" fontSize="lg">
              {headerLabel} ({getConnectionStatus()})
            </Text>
          </Flex>
          <Icon as={FiPhone} boxSize={5} />
        </Flex>
      </Box>

      {/* 연결/에러 바 */}
      {(connectionState !== 'connected' || lastError) && (
        <Box bg={lastError || connectionState === 'failed' ? 'red.100' : 'yellow.100'} p={2} textAlign="center">
          <Text color={lastError || connectionState === 'failed' ? 'red.600' : 'orange.600'} fontSize="sm">
            {lastError ||
              (connectionState === 'failed'
                ? '채팅 서버 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.'
                : '채팅 서버에 연결 중입니다...')}
          </Text>
          {lastError && (
            <Text color="red.500" fontSize="xs" mt={1} cursor="pointer" onClick={() => setLastError(null)} textDecoration="underline">
              닫기
            </Text>
          )}
        </Box>
      )}

      {/* 메시지 리스트 */}
      <Box flex="1">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: '100%' }}
          data={messages}
          firstItemIndex={firstItemIndex}
          startReached={hasMoreHistory ? handleStartReached : undefined}
          followOutput="auto"
          itemContent={(_, msg) => (
            <Box px={4} py={2}>
              <ChatMessageRenderer
                message={msg}
                myUserId={roomUserId}
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
          <LongButton w="10" h="10" p="0" bg="white" type="button" onClick={handlePoke} disabled={!isConnected}>
            <Image src={poke_icon} w={10} />
          </LongButton>
          <TextInput
            h="40px"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? '메시지를 입력하세요' : '연결 중...'}
            disabled={!isConnected}
          />
          <LongButton w="13" h="10" type="submit" disabled={!isConnected || !message.trim()}>
            {lastError ? '재시도' : '보내기'}
          </LongButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatRoomPage;
