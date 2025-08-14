import {
  Box,
  Flex,
  Icon,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import TextInput from '@/components/inputs/TextInput';
import { useState, useCallback } from 'react';
import LongButton from '@/components/buttons/LongButton';
import type { Message } from '@/types/chat/chat';
import ChatMessageRenderer from '@/components/chat/ChatMessageRenderer';
import { Virtuoso } from 'react-virtuoso';

const generatePastMessages = (count: number, offset: number): Message[] => {
  return Array.from({ length: count }, (_, i) => {
    const messageId = offset + i;
    const isSender = Math.random() > 0.5;
    return {
      id: `message-${Date.now()}-${messageId}`,
      sender: isSender ? 'my-user-id' : 'other-user-id',
      content: `이것은 ${messageId}번째 과거 메시지입니다.`,
      time: new Date(Date.now() - (100 - messageId) * 60000).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'text',
    };
  });
};

const allServerMessages = generatePastMessages(100, 0);
const INITIAL_MESSAGE_COUNT = 30;

const TestPage = () => {
  const myUserId = 'my-user-id';

  // ❗ 1. firstItemIndex 상태 추가: 현재 데이터의 시작 인덱스를 관리합니다.
  const [firstItemIndex, setFirstItemIndex] = useState(
    allServerMessages.length - INITIAL_MESSAGE_COUNT
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    allServerMessages.slice(allServerMessages.length - INITIAL_MESSAGE_COUNT)
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
  const loadMore = useCallback(() => {
    if (isLoading || firstItemIndex === 0) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const itemsToPrepend = 20;
      // 다음으로 가져올 메시지의 시작 인덱스를 계산합니다.
      const nextFirstItemIndex = Math.max(0, firstItemIndex - itemsToPrepend);
      
      // 서버 메시지 배열에서 필요한 부분을 잘라냅니다.
      const newMessages = allServerMessages.slice(nextFirstItemIndex, firstItemIndex);
      
      setMessages(prev => [...newMessages, ...prev]);
      // ❗ 2. firstItemIndex 상태를 업데이트합니다.
      setFirstItemIndex(nextFirstItemIndex);
      
      setIsLoading(false);
    }, 1000); // 1초 지연 시뮬레이션
  }, [isLoading, firstItemIndex]);

  const handleStartReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('메시지 전송 시도:', message);
  };

  return (
    <Box position="relative" h="100vh" display="flex" flexDirection="column">
      <Box as="header" position="sticky" top="0" zIndex="10" bg="white" borderBottom="1px solid #ccc" p={4}>
        <Flex align="center" justify="space-between">
          <Text fontWeight="bold" fontSize="lg" textAlign="center" flex="1">
            무한스크롤 테스트
          </Text>
          <Icon as={FiPhone} boxSize={5} />
        </Flex>
      </Box>

      <Box flex="1" overflowY="auto">
        <Virtuoso
          style={{ height: '100%' }}
          data={messages}
          // ❗ 3. 상태로 관리되는 firstItemIndex를 prop으로 전달합니다.
          firstItemIndex={firstItemIndex}
          // ❗ 4. 초기 스크롤 위치는 전체 데이터의 마지막으로 고정합니다.
          initialTopMostItemIndex={allServerMessages.length - 1}
          startReached={handleStartReached}
          itemContent={(_index, msg) => {
            // Virtuoso 내부 index는 0부터 시작하므로, 실제 데이터 인덱스는 firstItemIndex를 더해줘야 합니다.
            // 여기서는 msg.id가 고유하므로 index를 직접 사용할 필요는 없습니다.
            return (
              <Box key={msg.id} px={4} py={2}>
                <ChatMessageRenderer message={msg} myUserId={myUserId} />
              </Box>
            )
          }}
          components={{
            Header: () => (
              <Center p={4}>
                {isLoading && <Spinner />}
              </Center>
            ),
          }}
        />
      </Box>

      <Box as="footer" position="sticky" bottom="0" bg="white" borderTop="1px solid #ccc" zIndex="10">
        <Flex as="form" onSubmit={handleSendMessage} p={2} gap={1}>
          <LongButton w="10" h="10" p="0" bg="white" type="button" disabled>
            <Text>?</Text>
          </LongButton>
          <TextInput
            h="40px"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지 입력은 비활성화되어 있습니다."
            disabled
          />
          <LongButton w="13" h="10" type="submit" disabled>
            보내기
          </LongButton>
        </Flex>
      </Box>
    </Box>
  );
};

export default TestPage;