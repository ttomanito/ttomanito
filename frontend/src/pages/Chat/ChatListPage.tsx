// src/pages/ChatListPage.tsx
import { Box, Flex, Text, VStack, Badge, Image, Spinner, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRequest } from '@/api/requests'; // 중앙화된 API 요청 함수 import
import profile_manito from '@/assets/ttomas/profile_manito.png';

// API 응답 데이터 타입을 정의합니다.
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
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const responseData = await getRequest<ChatApiResponse>('/chat/roomlist');

        // API 응답에서 'manito'와 'manitee' 두 개의 채팅방 정보를 배열로 변환합니다.
        const chatDataArray = [responseData.manito, responseData.manitee];
        setChatList(chatDataArray);
      } catch (err) {
        console.error('채팅방 목록을 불러오는 데 실패했습니다.', err);
        setError('채팅방 목록을 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="100vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Box p={4}>
      <VStack align="stretch" gap="0">
        {chatList.map((chat, index) => (
          <Link key={chat.chatRoom.chattingRoomId} to={`/chat/${chat.chatRoom.chattingRoomId}`}>
            <Flex
              align="center"
              _hover={{ bg: 'gray.100' }}
              px="2"
              py="4"
              // 마지막 요소가 아닐 때만 borderBottom을 추가합니다.
              // 마지막 요소가 아닐 때만 아래 border를 적용
              borderBottomWidth={index === chatList.length - 1 ? '0' : '1px'}
              borderBottomStyle="solid"
              borderBottomColor="gray.200"
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
                <Image src={profile_manito} mr={3}></Image>
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">
                  {chat.chatRoom.manitoAssignmentId % 2 === 0 ? '마니또' : '마니띠'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {chat.chatRoom.lastMessage}
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.400">
                  {new Date(chat.chatRoom.lastMessageTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Badge mt={1} colorScheme="purple" borderRadius="full" fontSize="0.7rem" px={2}>
                  {chat.chatUserInfo.unreadCount}
                </Badge>
              </Box>
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatListPage;
