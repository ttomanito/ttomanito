// src/pages/ChatListPage.tsx
import { Box, Flex, Text, VStack, Badge, Image, Spinner } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRequest } from '@/api/requests';
import { useAuth } from '@/stores/authStore';
import profile_manito from '@/assets/ttomas/profile_manito.png';
import profile_manitee from '@/assets/ttomas/profile_manitee.png';

// 🔥 추가: API 응답 타입 정의
interface ChatRoom {
  id: number;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  type: 'MANITO' | 'MANITEE'; // 마니또인지 마니띠인지
  avatar?: string;
}

const ChatListPage = () => {
  // 🔥 추가: auth store에서 게임 정보 가져오기
  const { gameInfo, isReady } = useAuth();
  const isInGame = gameInfo.status === 'IN_GAME';
  const roomId = gameInfo.roomId;

  // 🔥 추가: 상태 관리
  const [chatList, setChatList] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 추가: 채팅방 목록 가져오기
  useEffect(() => {
    if (!isReady || !isInGame || !roomId) {
      // 게임 중이 아니면 더미 데이터라도 보여주기
      setChatList([
        {
          id: 1,
          name: '마니또',
          lastMessage: '게임에 참여해서 채팅을 시작해보세요!',
          lastMessageTime: '',
          unreadCount: 0,
          type: 'MANITO',
        },
        {
          id: 2,
          name: '마니띠',
          lastMessage: '게임에 참여해서 채팅을 시작해보세요!',
          lastMessageTime: '',
          unreadCount: 0,
          type: 'MANITEE',
        },
      ]);
      setIsLoading(false);
      return;
    }

    const fetchChatList = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 🔥 실제 API 호출 (API 엔드포인트는 실제 백엔드에 맞게 수정)
        const chatRooms = await getRequest<ChatRoom[]>('/chat/rooms');
        setChatList(chatRooms);
      } catch (err) {
        console.error('채팅방 목록 불러오기 실패:', err);
        setError('채팅방 목록을 불러올 수 없습니다.');
        
        // 🔥 에러 시 기본 채팅방 표시
        setChatList([
          {
            id: 1,
            name: '마니또',
            lastMessage: '아직 메시지가 없습니다.',
            lastMessageTime: '',
            unreadCount: 0,
            type: 'MANITO',
          },
          {
            id: 2,
            name: '마니띠',
            lastMessage: '아직 메시지가 없습니다.',
            lastMessageTime: '',
            unreadCount: 0,
            type: 'MANITEE',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatList();
  }, [isReady, isInGame, roomId]);

  // 🔥 추가: 아바타 이미지 선택 함수
  const getAvatarImage = (type: 'MANITO' | 'MANITEE', customAvatar?: string) => {
    if (customAvatar) return customAvatar;
    return type === 'MANITO' ? profile_manito : profile_manitee;
  };

  // 🔥 추가: 로딩 상태
  if (!isReady || isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      {/* 🔥 추가: 에러 표시 */}
      {error && (
        <Box mb={4} p={3} bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.400">
          <Text color="red.600" fontSize="sm">{error}</Text>
        </Box>
      )}

      {/* 🔥 추가: 게임 상태 안내 */}
      {!isInGame && (
        <Box mb={4} p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
          <Text color="blue.600" fontSize="sm">
            게임에 참여하면 마니또/마니띠와 채팅할 수 있어요!
          </Text>
        </Box>
      )}

      <VStack align="stretch" gap="0">
        {chatList.map(chat => (
          <Link key={chat.id} to={`/chat/${chat.id}`}>
            <Flex
              align="center"
              _hover={{ bg: 'gray.100' }}
              px="2"
              py="4"
              border="1px solid black"
              borderRadius="md"
              gap={3}
              opacity={!isInGame ? 0.6 : 1} // 🔥 추가: 게임 중이 아니면 흐리게
              cursor={!isInGame ? 'not-allowed' : 'pointer'} // 🔥 추가: 커서 변경
            >
              <Box
                w={12}
                p={1}
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.disabled"
                color="fg.disabled"
              >
                <Image 
                  src={getAvatarImage(chat.type, chat.avatar)} 
                  mr={3}
                  alt={`${chat.name} 프로필`}
                />
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">{chat.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {chat.lastMessage || '아직 메시지가 없습니다.'}
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.400">
                  {chat.lastMessageTime || ''}
                </Text>
                {(chat.unreadCount || 0) > 0 && (
                  <Badge mt={1} colorPalette="purple" borderRadius="full" fontSize="0.7rem" px={2}>
                    {chat.unreadCount}
                  </Badge>
                )}
              </Box>
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatListPage;