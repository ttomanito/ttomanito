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
    { id: '1', sender: 'me', content: '안녕하세요', time: '7:50 PM', type: 'text' },
    {
      id: '2',
      sender: 'me',
      content: '오늘 과자 놓고 갔는데 봤어?',
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
    { id: '4', sender: 'other', content: '잘 먹을게 고마워!❤️', time: '7:53 PM', type: 'text' },
    { id: '5', sender: 'other', content: '', time: '7:54 PM', type: 'poke' },
    { id: '6', sender: 'me', content: '', time: '7:55 PM', type: 'poke' },
    { id: '8', sender: 'me', content: '오늘 미션 했어?', time: '7:57 PM', type: 'text' },
    { id: '9', sender: 'other', content: '응 바로 했지~', time: '7:58 PM', type: 'text' },
    { id: '10', sender: 'me', content: '', time: '7:59 PM', type: 'poke' },
    { id: '12', sender: 'me', content: 'ㅋㅋㅋㅋ', time: '8:01 PM', type: 'text' },
    { id: '13', sender: 'other', content: '마니또 누구야 진짜ㅋㅋ', time: '8:02 PM', type: 'text' },
    { id: '14', sender: 'me', content: '', time: '8:03 PM', type: 'poke' },
    { id: '15', sender: 'other', content: '', time: '8:04 PM', type: 'poke' },
    { id: '17', sender: 'me', content: '밥 먹고 올게', time: '8:06 PM', type: 'text' },
    { id: '18', sender: 'other', content: '오케이~', time: '8:07 PM', type: 'text' },
    { id: '19', sender: 'me', content: '', time: '8:08 PM', type: 'poke' },
    { id: '21', sender: 'me', content: '다시 왔어', time: '8:10 PM', type: 'text' },
    { id: '22', sender: 'other', content: 'ㅎㅇㅎㅇ', time: '8:11 PM', type: 'text' },
    { id: '23', sender: 'me', content: '', time: '8:12 PM', type: 'poke' },
    { id: '25', sender: 'me', content: '오늘 미션 어려워', time: '8:14 PM', type: 'text' },
    { id: '26', sender: 'other', content: '맞아ㅠㅠ', time: '8:15 PM', type: 'text' },
    { id: '27', sender: 'me', content: '', time: '8:16 PM', type: 'poke' },
    { id: '29', sender: 'me', content: '힌트 좀 줘봐!', time: '8:18 PM', type: 'text' },
    { id: '30', sender: 'other', content: '힌트? 나 아냐 😎', time: '8:19 PM', type: 'text' },
    {
      id: '28',
      sender: 'system',
      content: '',
      time: '8:17 PM',
      type: 'system',
      systemCategory: 'exit',
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <Box position="relative">
      {/* 상단 헤더 */}
      <Box position="sticky" top="0" zIndex="10" bg="white" borderBottom="1px solid #ccc" p={4}>
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
      {/* <Box textAlign="center" color="gray.400" fontSize="xs" py={2}>
        4월 19일
      </Box> */}

      <Box py={3} pr={4} pl={4} overflowY="auto">
        <VStack gap={3} align="stretch">
          {messages.map(el => (
            <ChatMessageRenderer key={el.id} message={el} />
          ))}
        </VStack>
      </Box>

      {/* 입력창 */}
      <Flex
        position="sticky"
        bottom="0"
        left="0"
        right="0"
        px={4}
        py={3}
        gap={2}
        bg="white"
        borderTop="1px solid #ccc"
        zIndex="10"
      >
        <LongButton w="10" h="10">
          dd
        </LongButton>
        <TextInput value={message} onChange={handleChange} placeholder="메시지를 입력하세요" />
        <LongButton w="10" h="10">
          보내기
        </LongButton>
      </Flex>
    </Box>
  );
};

export default ChatRoomPage;
