// src/components/chat/ChatBubble.tsx

import { Box, Text, Flex, Image } from '@chakra-ui/react';
import type { Message } from '@/types/chat/chat';
import ttoma_poke from '@/assets/ttoma_poke.png';

// 1. props 타입 정의: message와 myUserId를 받도록 명시
interface ChatBubbleProps {
  message: Message;
  myUserId: string;
}

const ChatBubble = ({ message, myUserId }: ChatBubbleProps) => {
  // message 객체에서 필요한 값들을 추출합니다.
  const { sender, content, time, type = 'text' } = message;

  // 2. 'isMe' 판단 로직 변경 (가장 중요한 부분)
  //    'me' 문자열과 비교하는 대신, 실제 ID를 비교합니다.
  const isMe = sender === myUserId;

  const renderBubbleContent = () => {
    if (type === 'poke') {
      return (
        <Box bg="gray.100" px={4} py={2} borderRadius="lg" maxW="30%">
          <Image src={ttoma_poke} />
          {/* 3. 내가 찔렀는지, 찔렸는지에 따라 다른 텍스트를 보여줍니다. */}
          <Text textStyle="body_sm">{isMe ? '콕! 찔렀어요 👉' : '👈 콕! 찔렸어요'}</Text>
        </Box>
      );
    }

    // 일반 텍스트 메시지
    return (
      <Box bg={isMe ? 'accent.500' : 'gray.100'} px={4} py={2} borderRadius="lg" maxW="80%">
        <Text textStyle="body_sm" whiteSpace="pre-wrap">
          {content}
        </Text>
      </Box>
    );
  };

  const renderTime = () =>
    time && (
      <Text
        textStyle="caption_xs_light"
        color="gray.500"
        fontSize="xs"
        minW="40px"
        textAlign={isMe ? 'right' : 'left'}
      >
        {time}
      </Text>
    );

  // 정렬 로직은 isMe 값에 따라 그대로 동작합니다.
  return (
    <Flex justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap={1}>
      {isMe && renderTime()}
      {renderBubbleContent()}
      {!isMe && renderTime()}
    </Flex>
  );
};

export default ChatBubble;