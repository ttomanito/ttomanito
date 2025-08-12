// src/pages/ChatRoomPage.tsx
import { Box, Flex, Icon, Text, VStack, Image } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import TextInput from '@/components/inputs/TextInput';
import { useState, useCallback, useRef, useEffect } from 'react';
import LongButton from '@/components/buttons/LongButton';
import type { Message } from '@/types/chat/chat';
import ChatMessageRenderer from '@/components/chat/ChatMessageRenderer';
import poke_icon from '@/assets/poke_icon.svg';
import { useChatSocket } from '@/utils/useChatSocket';
import { useAuth } from '@/stores/authStore'; // 🔥 추가: auth store 사용

const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();

  // 🔥 변경: auth store에서 사용자 정보 가져오기
  const { user, isReady } = useAuth();
  const myUserId = user?.id || null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');

  const handleNewMessage = useCallback((receivedMessage: { senderRoomUserId: number; sentAt: string; content?: string; }) => {
    // myUserId가 설정되지 않았다면 메시지 처리를 중단합니다.
    if (!myUserId) return;

    const newMessage: Message = {
      id: receivedMessage.sentAt,
      // 'sender'를 실제 ID와 비교하도록 수정했습니다.
      sender: String(receivedMessage.senderRoomUserId),
      content: receivedMessage.content || '',
      time: new Date(receivedMessage.sentAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: receivedMessage.content ? 'text' : 'poke',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, [myUserId]);

  // myUserId가 설정되었을 때만 웹소켓 훅을 호출합니다.
  const { sendMessage, sendPoke, isConnected } = useChatSocket({
    // myUserId가 있을 때만 연결하도록 chatRoomId와 myUserId를 전달합니다.
    chatRoomId: myUserId ? chatRoomId || '1' : null,
    myUserId: myUserId,
    onMessage: handleNewMessage,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handlePoke = () => {
    if (isConnected) {
      sendPoke();
    }
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 🔥 변경: auth store의 준비 상태와 사용자 정보 확인
  if (!isReady || !myUserId) {
    return <Box>사용자 정보를 불러오는 중...</Box>;
  }

  return (
    <Box position="relative" h="100vh" display="flex" flexDirection="column">
      {/* 상단 헤더 */}
      <Box as="header" position="sticky" top="0" zIndex="10" bg="white" borderBottom="1px solid #ccc" p={4}>
        <Flex align="center" justify="space-between">
          <Text fontWeight="bold" fontSize="lg" textAlign="center" flex="1">
            마니또 (연결 상태: {isConnected ? '✅' : '❌'})
          </Text>
          <Icon as={FiPhone} boxSize={5} />
        </Flex>
      </Box>

      {/* 메시지 목록 */}
      <Box ref={chatContainerRef} flex="1" py={3} pr={4} pl={4} overflowY="auto">
        <VStack gap={3} align="stretch">
          {messages.map((el) => (
            // `myUserId`를 ChatMessageRenderer로 전달합니다.
            <ChatMessageRenderer key={el.id} message={el} myUserId={myUserId} />
          ))}
        </VStack>
      </Box>

      {/* 입력창 */}
      <Box as="footer" position="sticky" bottom="0" bg="white" borderTop="1px solid #ccc" zIndex="10">
        <Flex as="form" onSubmit={handleSendMessage} p={2} gap={1}>
          <LongButton w="10" h="10" p="0" bg="white" type="button" onClick={handlePoke}>
            <Image src={poke_icon} w={10} />
          </LongButton>
          <TextInput
            h="40px"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "메시지를 입력하세요" : "연결 중..."}
            disabled={!isConnected}
          />
          <LongButton w="13" h="10" type="submit" disabled={!isConnected}>
            보내기
          </LongButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatRoomPage;