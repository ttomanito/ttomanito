// src/components/chat/ChatBubble.tsx - 새로운 메시지 타입 지원

import { Box, Text, Flex, Image, Button, HStack } from '@chakra-ui/react';
import type { Message } from '@/types/chat/chat';
import ttoma_poke from '@/assets/ttoma_poke.png';

interface ChatBubbleProps {
  message: Message;
  myUserId: string;
  onCallAccept?: () => void; // 통화 수락 콜백
  onCallReject?: () => void; // 통화 거절 콜백
}

const ChatBubble = ({ message, myUserId, onCallAccept, onCallReject }: ChatBubbleProps) => {
  const { sender, content, time, type = 'text' } = message;
  const isMe = sender === myUserId;

  const renderBubbleContent = () => {
    switch (type) {
      case 'poke':
        return (
          <Box bg="purple.100" px={4} py={2} borderRadius="lg" maxW="30%" textAlign="center">
            <Image src={ttoma_poke} mx="auto" mb={2} />
            <Text textStyle="body_sm" color="purple.700">
              {isMe ? '콕! 찔렀어요 👉' : '👈 콕! 찔렸어요'}
            </Text>
          </Box>
        );

      case 'call_start':
        return (
          <Box bg="blue.100" px={4} py={2} borderRadius="lg" maxW="60%">
            <Text textStyle="body_sm" color="blue.700" mb={2}>
              📞 {isMe ? '통화를 요청했습니다' : '통화 요청이 도착했어요'}
            </Text>
            {!isMe && (
              <HStack gap={2}>
                <Button 
                  size="sm" 
                  colorScheme="green" 
                  onClick={onCallAccept}
                  flex={1}
                >
                  수락
                </Button>
                <Button 
                  size="sm" 
                  colorScheme="red" 
                  onClick={onCallReject}
                  flex={1}
                >
                  거절
                </Button>
              </HStack>
            )}
          </Box>
        );

      case 'call_accept':
        return (
          <Box bg="green.100" px={4} py={2} borderRadius="lg" maxW="50%" textAlign="center">
            <Text textStyle="body_sm" color="green.700">
              ✅ {isMe ? '통화를 수락했습니다' : '상대방이 통화를 수락했어요'}
            </Text>
          </Box>
        );

      case 'call_reject':
        return (
          <Box bg="red.100" px={4} py={2} borderRadius="lg" maxW="50%" textAlign="center">
            <Text textStyle="body_sm" color="red.700">
              ❌ {isMe ? '통화를 거절했습니다' : '상대방이 통화를 거절했어요'}
            </Text>
          </Box>
        );

      default: // 'text'
        return (
          <Box bg={isMe ? 'accent.500' : 'gray.100'} px={4} py={2} borderRadius="lg" maxW="80%">
            <Text textStyle="body_sm" whiteSpace="pre-wrap" color={isMe ? 'white' : 'black'}>
              {content}
            </Text>
          </Box>
        );
    }
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

  return (
    <Flex justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap={1}>
      {isMe && renderTime()}
      {renderBubbleContent()}
      {!isMe && renderTime()}
    </Flex>
  );
};

export default ChatBubble;