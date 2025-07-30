import { Box, Button, Flex, Text, VStack, HStack, Clipboard, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import FramedCard from '@/components/ui/FramedCard';
import { LuShare2 } from 'react-icons/lu';
import { toaster } from '@/components/ui/toastStore';

const WaitingRoomPage = () => {
  const navigate = useNavigate();
  const inviteUrl = 'https://tomanito.app/invite/12345';

  const handleJoin = () => {
    navigate('/home');
  };

  return (
    <Box px={4} py={6} maxW="400px" mx="auto">
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
        또마니또
      </Text>

      <FramedCard header="그룹 이름" accent="#cdbbff" mb={4}>
        <HStack justify="space-between" gap={4} mb={2}>
          <VStack gap={0}>
            <Text fontSize="sm" color="gray.500">
              시작일
            </Text>
            <Text fontWeight="bold">07/25</Text>
          </VStack>
          <VStack gap={0}>
            <Text fontSize="sm" color="gray.500">
              종료일
            </Text>
            <Text fontWeight="bold">07/25</Text>
          </VStack>
        </HStack>
        <Text fontSize="sm" color="gray.500" mb={1}>
          미션 수행 요일
        </Text>
        <HStack gap={2}>
          {['월', '수', '금'].map(day => (
            <Box key={day} px={2} py={1} bg="#f3e8ff" borderRadius="md" fontWeight="bold">
              {day}
            </Box>
          ))}
        </HStack>
      </FramedCard>

      <FramedCard header="참여자" accent="#a4b8fb" mb={4}>
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">참여자</Text>
          <Text color="gray.500">5명</Text>
        </HStack>
        <VStack gap={2} align="stretch">
          <Box border="2px solid #a4b8fb" borderRadius="md" p={2}>
            <Flex justify="space-between">
              <Box>
                <Text fontWeight="bold">이지혜</Text>
                <Text fontSize="xs" color="gray.500">
                  테니스팡
                </Text>
              </Box>
              <Box bg="#a4b8fb" color="white" fontSize="xs" px={2} py={1} borderRadius="full">
                방장
              </Box>
            </Flex>
          </Box>
          <Box border="2px solid #beadff" borderRadius="md" p={2}>
            <Text fontWeight="bold">길태은</Text>
            <Text fontSize="xs" color="gray.500">
              길셰프
            </Text>
          </Box>
          <Box border="1px solid #ccc" borderRadius="md" p={2}>
            <Text fontWeight="bold">우지연</Text>
            <Text fontSize="xs" color="gray.500">
              안녕하세요
            </Text>
          </Box>
          <Box border="1px solid #ccc" borderRadius="md" p={2}>
            <Text fontWeight="bold">양준하</Text>
            <Text fontSize="xs" color="gray.500">
              양
            </Text>
          </Box>
        </VStack>
      </FramedCard>

      <HStack gap={3} mt={4}>
        <Clipboard.Root
          value={inviteUrl}
          onCopy={() =>
            toaster.create({
              title: '복사 완료!',
              description: inviteUrl,
              type: 'success',
              duration: 2000,
              closable: true,
            })
          }
        >
          <Clipboard.Trigger asChild>
            <Button colorScheme="purple" variant="outline" flex={1}>
              <Icon as={LuShare2} boxSize={4} mr={2} />
              <Clipboard.CopyText>링크 복사</Clipboard.CopyText>
            </Button>
          </Clipboard.Trigger>
        </Clipboard.Root>

        <Button colorScheme="blackAlpha" flex={1} onClick={handleJoin}>
          시작하기
        </Button>
      </HStack>
    </Box>
  );
};

export default WaitingRoomPage;
