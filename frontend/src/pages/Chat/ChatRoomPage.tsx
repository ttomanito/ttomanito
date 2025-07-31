// src/pages/ChatRoomPage.tsx
import { Avatar, Box, Flex, Icon, Input, Text, VStack, IconButton, Image } from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import TextInput from '@/components/TextInput';
import { useState } from 'react';
import LongButton from '@/components/buttons/LongButton';
import profile_manito from '@/assets/profile_manito.png';

const ChatRoomPage = () => {
  const { id } = useParams(); // '1' 또는 '2'가 들어옴
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    console.log(e.target.value);
  };

  const alertMsg = () => {
    return;
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
      <VStack px={4} spacing={3} align="flex-start">
        <Box
          alignSelf="flex-end"
          bg="accent.500"
          px={4}
          py={2}
          borderRadius="lg"
          position="relative"
        >
          <Text textStyle="body_sm">안녕하세요</Text>
          <Text
            textStyle="caption_xs_light"
            position="absolute"
            bottom="0" // 말풍선 위로 띄우기
            left={-1}
            transform="translateX(-100%)" // 시간 텍스트 너비만큼 이동
            color="gray.500"
            fontSize="xs"
          >
            7:50 PM
          </Text>
        </Box>
        <Box alignSelf="flex-end" bg="accent.500" px={4} py={2} borderRadius="lg">
          <Text textStyle="body_sm">오늘 내가 과자 놓고 갔었는데 봤어?</Text>
        </Box>
        <Box bg="gray.100" px={4} py={2} borderRadius="lg">
          <Text textStyle="body_sm">응 아까 밥 먹고 오니까 있더라ㅎㅎ</Text>
        </Box>
        <Box bg="gray.100" px={4} py={2} borderRadius="lg">
          <Text textStyle="body_sm">잘 먹을게 고마워!❤️</Text>
        </Box>
        <Box px={4} py={2} borderRadius="lg">
          <Box w={24} p={1}>
            <Image src={profile_manito} mr={3}></Image>
          </Box>
          {/* <Text textStyle="body_sm">콕! 찌르기 👉</Text> */}
        </Box>
        <Box bg="gray.100" px={4} py={2} borderRadius="lg">
          <Text textStyle="body_sm">콕! 찌르기 👉</Text>
        </Box>
      </VStack>

      {/* 퇴장 메시지 */}
      <Box bg="gray.200" textAlign="center" color="gray.500" textStyle="body_sm" py={2}>
        <Text textStyle="body_sm"> 마니또가 퇴장하였습니다.</Text>
      </Box>

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
