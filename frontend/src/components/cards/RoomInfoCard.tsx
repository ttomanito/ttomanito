// src/components/cards/RoomInfoCard.tsx

import { Box, Text, VStack, HStack, SimpleGrid, Button } from '@chakra-ui/react';
import CommonCard from '@/components/cards/CommonCard';
import type { RoomInfo } from '@/hooks/useRoomInfo'; // useRoomInfo 훅의 타입을 재사용

interface RoomInfoCardProps {
  roomInfo: RoomInfo | null;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ roomInfo }) => {
  if (!roomInfo) {
    return null; // 데이터가 없으면 아무것도 렌더링하지 않음
  }

  // MON -> 월, TUE -> 화 변환 맵
  const dayMapEngToKor: { [key: string]: string } = {
    MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일',
  };

  return (
    <VStack align="stretch" w="full" gap={3}>
      {/* 그룹 이름 - 카드 외부에 위치 */}
      <Text textStyle="title_mlg">대기방:{roomInfo.name}</Text>
      
      <VStack align="stretch" w="full">
        {/* 시작일 / 종료일 - 원본처럼 분리된 박스 */}
        <HStack w="full" gap={4}>
          <Box flex={1} p={3} borderWidth="1px" borderColor="gray.200" borderRadius="xl">
            <Text textStyle="body_sm" color="gray.600">시작일</Text>
            <Text textStyle="body_md"  mt={1}>
              {roomInfo.startDate}
            </Text>
          </Box>
          <Box flex={1} p={3} borderWidth="1px" borderColor="gray.200" borderRadius="xl">
            <Text textStyle="body_sm" color="gray.600">종료일</Text>
            <Text textStyle="body_md"  mt={1}>
              {roomInfo.endDate}
            </Text>
          </Box>
        </HStack>

        {/* 미션 수행 요일 - 하나의 박스로 묶임 */}
        <CommonCard my={3}>
          <VStack align="start">
            <Text textStyle="title_md">미션 수행 요일</Text>

            <SimpleGrid columns={7} gap={3} w="100%">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                <Button
                  key={day}
                  size="sm"
                  variant="outline"
                  borderColor={roomInfo.missionDays.includes(day) ? 'accent.500' : 'gray.300'}
                  color={roomInfo.missionDays.includes(day) ? 'accent.500' : 'gray.600'}
                  borderWidth="1.5px"
                  borderRadius="lg"
                  bg="white"
                  cursor="default"
                  _hover={{}}
                  _active={{}}
                  onClick={() => {}} // 클릭 불가능
                >
                  {dayMapEngToKor[day]}
                </Button>
              ))}
            </SimpleGrid>
          </VStack>
        </CommonCard>
      </VStack>
    </VStack>
  );
};

export default RoomInfoCard;