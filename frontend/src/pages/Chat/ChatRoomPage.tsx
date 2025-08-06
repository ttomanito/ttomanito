// src/pages/ChatRoomPage.tsx
import { Box, Flex, Icon, Text, VStack } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
// import { useParams } from 'react-router-dom';
import TextInput from '@/components/TextInput';
import { useState } from 'react';
import LongButton from '@/components/buttons/LongButton';
import type { Message } from '@/types/chat/chat';
import ChatMessageRenderer from '@/components/chat/ChatMessageRenderer';

const ChatRoomPage = () => {
  // const { chatRoomId } = useParams(); // '1' 또는 '2'가 들어옴
  const [message, setMessage] = useState('');
  const [messages] = useState<Message[]>([
    {
      id: '2',
      sender: 'me',
      content: '오늘 내가 과자 놓고 갔었는데 봤어?',
      time: '7:51 PM',
      type: 'text',
    },
    {
      id: '3',
      sender: 'other',
      content: '응 아까 밥 먹고 오니까 있더라ㅎㅎ',
      time: '7:52 PM',
      type: 'text',
    },
    {
      id: '4',
      sender: 'other',
      content: '잘 먹을게 고마워!❤️',
      time: '7:53 PM',
      type: 'text',
    },
    {
      id: '5',
      sender: 'other',
      time: '7:54 PM',
      type: 'poke',
      content: '',
    },
    {
      id: '6',
      sender: 'me',
      time: '8:00 PM',
      type: 'poke',
      content: '',
    },
    {
      id: '7',
      sender: 'system',
      time: '8:00 PM',
      type: 'system',
      content: '',
      systemCategory: 'exit',
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

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
          <ChatMessageRenderer message={el} />
        ))}
      </VStack>

      {/* 퇴장 메시지 */}
      {/* <ChatMessageRenderer message={messages[5]} /> */}

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
          보내기
        </LongButton>
        {/* <Input placeholder="메시지를 입력하세요" /> */}
      </Flex>
    </Box>
  );
};

export default ChatRoomPage;
