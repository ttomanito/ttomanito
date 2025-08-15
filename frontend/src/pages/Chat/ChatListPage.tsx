// src/pages/Chat/ChatListPage.tsx
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, VStack, Badge, Image, Spinner, Center } from '@chakra-ui/react';
// import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRequest, postRequest } from '@/api/requests';
import { useAuth } from '@/stores/authStore';
import profile_manito from '@/assets/ttomas/profile_manito.png';
import profile_manitee from '@/assets/ttomas/profile_manitee.png';

// API 응답 데이터 타입 정의
interface ChatRoomData {
  chattingRoomId: number;
  manitoAssignmentId: number;
  lastMessage: string;
  lastMessageTime: string;
}

interface ChatUserInfo {
  chattingRoomId: number;
  roomUserId: number;
  unreadCount: number;
  lastReadTime: string | null;
}

interface ChatItem {
  chatRoom: ChatRoomData;
  chatUserInfo: ChatUserInfo;
}

interface ChatApiResponse {
  manito: ChatItem;
  manitee: ChatItem;
}

const ChatListPage = () => {
  // 새로운 스토어에서 게임 정보 가져오기
  const { gameInfo, isReady } = useAuth();
  const isInGame = gameInfo.status === 'IN_GAME';
  const roomId = gameInfo.roomId;

  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 파트너 정보 가져오기 함수
  const getChatPartnerInfo = (index: number) => {
    if (index == 0) {
      return { role: '마니또', profileImage: profile_manito };
    } else {
      return { role: '마니띠', profileImage: profile_manitee };
    }
  };

  const navigate = useNavigate();

  const enterChat = async (id: number, partner: { role: string; profileImage: string }) => {
    try {
      await postRequest(`/chat/${id}/enter`, {});
    } catch (e) {
      console.warn('채팅방 입장 API 실패:', e);
    }
    navigate(`/chat/${id}`, { state: { partner } });
  };

  useEffect(() => {
    if (!isReady) return;

    const fetchChatRooms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isInGame || !roomId) {
          // 게임 중이 아니면 빈 목록
          setChatList([]);
          return;
        }

        // 실제 API 호출
        const responseData = await getRequest<ChatApiResponse>('/chat/roomlist');

        // API 응답에서 'manito'와 'manitee' 두 개의 채팅방 정보를 배열로 변환
        const chatDataArray = [responseData.manito, responseData.manitee];
        setChatList(chatDataArray);
      } catch (err) {
        console.error('채팅방 목록을 불러오는 데 실패했습니다.', err);
        setError('채팅방 목록을 불러오지 못했습니다. 다시 시도해주세요.');
        setChatList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, [isReady, isInGame, roomId]);

  // 로딩 상태
  if (!isReady || isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Center height="100vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  // 게임 중이 아닐 때
  if (!isInGame) {
    return (
      <Center height="100vh">
        <VStack>
          <Text fontSize="lg" color="gray.500">
            게임에 참여해서 채팅을 시작해보세요!
          </Text>
          <Text fontSize="sm" color="gray.400">
            현재 게임 상태: {gameInfo.status}
          </Text>
        </VStack>
      </Center>
    );
  }

  // 채팅방 목록이 비어있을 때
  if (chatList.length === 0) {
    return (
      <Center height="100vh">
        <Text color="gray.500">아직 채팅방이 없습니다.</Text>
      </Center>
    );
  }

  return (
    <Box p={3} m={3}>
      <Text textStyle="title_mlg" mb={2}>✪ 채팅룸</Text>
      <Text textStyle="caption_sm" color="gray.600" mb={4}>익명으로 자유롭게 마음을 표현하며 따뜻한 대화를 나눠보세요!</Text>
      <VStack align="stretch" gap="0">
        {chatList.map((chat, index) => {
          // 파트너 정보 가져오기
          // chatList[0]: 마니또
          // chatList[1]: 마니띠
          const { profileImage } = getChatPartnerInfo(index);
          const partner = getChatPartnerInfo(index);

          return (
            // <Link key={chat.chatRoom.chattingRoomId} to={`/chat/${chat.chatRoom.chattingRoomId}`}>
              <Flex
                align="center"
                _hover={{ bg: 'gray.100' , cursor: 'pointer'}}
                onClick={() => enterChat(chat.chatRoom.chattingRoomId, partner)}
                px="4"
                py="4"
                borderBottomWidth={index === chatList.length - 1 ? '0' : '1px'}
                borderBottomStyle="solid"
                borderBottomColor="gray.100"
                gap={3}
              >
                <Box
                  w={12}
                  p={1}
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="border.disabled"
                  color="fg.disabled"
                >
                  <Image src={profileImage} alt={`${partner.role} 프로필`} mr={3} />
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold">{partner.role}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {chat.chatRoom.lastMessage || '아직 메시지가 없습니다.'}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="xs" color="gray.400">
                    {chat.chatRoom.lastMessageTime &&
                      new Date(chat.chatRoom.lastMessageTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </Text>
                  {chat.chatUserInfo.unreadCount > 0 && (
                    <Badge mt={1} colorScheme="purple" borderRadius="full" fontSize="0.7rem" px={2}>
                      {chat.chatUserInfo.unreadCount}
                    </Badge>
                  )}
                </Box>
              </Flex>
            // </Link>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ChatListPage;
