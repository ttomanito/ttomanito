// src/pages/ChatListPage.tsx
import { Box, Flex, Text, VStack, Badge, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import profile_manito from '@/assets/profile_manito.png';
const chatList = [
  {
    id: 1,
    name: '마니또',
    message: '이따 통화할래?',
    time: '7:50 PM',
    unread: 1,
    avatar: '/imgs/avatar1.png',
  },
  {
    id: 2,
    name: '마니띠',
    message: '선물 잘 받았어?',
    time: '7:50 PM',
    unread: 1,
    avatar: '/imgs/avatar2.png',
  },
];

const ChatListPage = () => {
  return (
    <Box p={4}>
      <VStack align="stretch" gap="0">
        {chatList.map(chat => (
          <Link key={chat.id} to={`/chat/${chat.id}`}>
            <Flex
              align="center"
              _hover={{ bg: 'gray.100' }}
              px="2"
              py="4"
              border="1px solid black"
              borderRadius="md"
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
                <Text fontWeight="bold">{chat.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {chat.message}
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.400">
                  {chat.time}
                </Text>
                <Badge mt={1} colorPalette="purple" borderRadius="full" fontSize="0.7rem" px={2}>
                  {chat.unread}
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
