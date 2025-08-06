// src/pages/ChatRoomPage.tsx
import { Box, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
// import { useParams } from 'react-router-dom';
import TextInput from '@/components/TextInput';
import { useState } from 'react';
import LongButton from '@/components/buttons/LongButton';
import type { Message } from '@/types/chat/chat';
import ChatBubble from '@/components/chat/ChatBubble';
import SystemMessage from '@/components/chat/SystemMessage';

const ChatRoomPage = () => {
  // const { chatRoomId } = useParams(); // '1' 또는 '2'가 들어옴
  const [message, setMessage] = useState('');
  const [messages] = useState<Message[]>([
    { sender: 'me', content: '안녕하세요', time: '7:50 PM' },
    { sender: 'me', content: '오늘 내가 과자 놓고 갔었는데 봤어?', time: '7:50 PM' },
    { sender: 'other', content: '응 아까 밥 먹고 오니까 있더라ㅎㅎ', time: '7:50 PM' },
    { sender: 'other', content: '응 아까 밥 먹고 오니까 있더라ㅎㅎ', time: '7:50 PM' },
    { sender: 'other', type: 'poke', time: '7:50 PM' },
    { sender: 'me', type: 'poke', time: '8:00 PM' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  // const alertMsg = () => {
  //   return;
  // };

  return (
    <Box position="relative" h="full">
      {/* 상단 헤더 */}
      <Box p={4} borderBottom="1px solid #ccc">
        <Box>
          <Flex align="center" justify="space-between">
            <Text fontWeight="bold" fontSize="lg" textAlign="center" flex="1">
              마니또
            </Text>
            <Icon as={FiPhone} boxSize={5} />
          </Flex>
        </Box>
      </Box>

      {/* 날짜 구분선 */}
      <Box textAlign="center" color="gray.400" fontSize="xs" py={2}>
        4월 19일
      </Box>

      {/* 메시지 영역 */}
      <VStack px={4} gap={3} align="stretch">
        {messages.map(el => (
          <ChatBubble sender={el?.sender} content={el?.content} time={el?.time} type={el?.type} />
        ))}
      </VStack>

      {/* 퇴장 메시지 */}
      <SystemMessage type="exit" />

      {/* 입력창 */}
      <Flex
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        px={4}
        py={3}
        gap={2}
        bg="white"
        borderTop="1px solid #ccc"
      >
        {/* 왼쪽 아이콘 버튼 */}
        <LongButton w="10" h="10">
          dd
        </LongButton>
        <TextInput
          value={message}
          onChange={handleChange}
          placeholder="메시지를 입력하세요"
        ></TextInput>
        <LongButton w="10" h="10">
          전송
        </LongButton>
        {/* <Input placeholder="메시지를 입력하세요" /> */}
      </Flex>
    </Box>
  );
};

export default ChatRoomPage;
