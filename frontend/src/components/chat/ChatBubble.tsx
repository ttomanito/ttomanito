import { Box, Text, Flex } from '@chakra-ui/react';
import type { Message } from '@/types/chat/chat';

const ChatBubble = ({ sender, content, time, type = 'text' }: Message) => {
  const isMe = sender === 'me';
  switch (type) {
    case 'text':
    case 'poke':
      return (
        <Flex justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap={1}>
          {/* 시간 - isMe일 때 왼쪽에 */}
          {isMe && time && (
            <Text
              textStyle="caption_xs_light"
              color="gray.500"
              fontSize="xs"
              minW="40px"
              textAlign="right"
            >
              {time}
            </Text>
          )}

          {/* 말풍선 */}
          {type == 'text' ? (
            <Box bg={isMe ? 'accent.500' : 'gray.100'} px={4} py={2} borderRadius="lg" maxW="80%">
              <Text textStyle="body_sm">{content}</Text>
            </Box>
          ) : (
            <Box bg="gray.100" px={4} py={2} borderRadius="lg" maxW="30%">
              <Text textStyle="body_sm">콕! 찌르기 👉</Text>
            </Box>
          )}

          {/* 시간 - 상대방일 때 오른쪽에 */}
          {!isMe && time && (
            <Text textStyle="caption_xs_light" color="gray.500" fontSize="xs" minW="40px">
              {time}
            </Text>
          )}
        </Flex>
      );
  }
};

export default ChatBubble;
