import { Box, Text, Flex, Image } from '@chakra-ui/react';
import type { Message } from '@/types/chat/chat';
import ttoma_poke from '@/assets/ttoma_poke.png';

const ChatBubble = ({ sender, content, time, type = 'text' }: Message) => {
  const isMe = sender === 'me';

  const renderBubbleContent = () => {
    if (type === 'poke') {
      return (
        <Box bg="gray.100" px={4} py={2} borderRadius="lg" maxW="30%">
          <Image src={ttoma_poke} />
          <Text textStyle="body_sm">콕! 찔렀어요 👉</Text>
        </Box>
      );
    }

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

  return (
    <Flex justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap={1}>
      {isMe && renderTime()}
      {renderBubbleContent()}
      {!isMe && renderTime()}
    </Flex>
  );
};

export default ChatBubble;
