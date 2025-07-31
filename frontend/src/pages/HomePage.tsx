import {
  Box,
  VStack,
  Text,
  Image,
  useDisclosure,
  HStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import CommonCard from '@/components/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import BaseModal from '@/components/modal/BaseModal';

const GameHomePage = () => {
  const startDate = '2025-07-28';
  const endDate = '2025-08-03';

  // ✅ 내부에서 진행 계산 함수 정의
  const { currentDay, totalDays } = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();

    const total = end.diff(start, 'day') + 1;
    let current = now.diff(start, 'day') + 1;

    if (current < 1) current = 1;
    if (current > total) current = total;

    return { currentDay: current, totalDays: total };
  }, [startDate, endDate]);

  const todayKey = dayjs().format('YYYY-MM-DD');
  const [isMissionRevealed, setIsMissionRevealed] = useState(false);

  useEffect(() => {
    const revealed = localStorage.getItem(`mission_revealed_${todayKey}`);
    setIsMissionRevealed(revealed === 'true');
  }, [todayKey]);

  const handleRevealMission = () => {
    if (!isMissionRevealed) {
      setIsMissionRevealed(true);
      localStorage.setItem(`mission_revealed_${todayKey}`, 'true');
    }
  };

  const prevMissionModal = useDisclosure();
  const manitoModal = useDisclosure();
  const voteModal = useDisclosure();

  return (
    <VStack gap={6} px={4} py={6} align="center">
      {/* 진행 바 */}
      <Box w="100%">
        <Text fontSize="sm" color="gray.600" mb={1} textAlign="center">
          {currentDay} / {totalDays}일
        </Text>
        <Box h="10px" bg="gray.200" borderRadius="full" overflow="hidden">
          <Box
            h="full"
            w={`${(currentDay / totalDays) * 100}%`}
            bg="purple.400"
            transition="width 0.3s ease"
          />
        </Box>
      </Box>

      {/* 미션 카드 */}
      <CommonCard
        onClick={handleRevealMission}
        cursor={!isMissionRevealed ? 'pointer' : 'default'}
      >
        <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={2}>
          오늘의 미션
        </Text>

        {!isMissionRevealed ? (
          <>
            <Text fontSize="4xl" textAlign="center" mb={2}>
              ???
            </Text>
            <Text textAlign="center" color="gray.500">
              클릭해서 오늘의 미션을 확인하세요
            </Text>
          </>
        ) : (
          <>
            <Text fontSize="md" textAlign="center" mb={2}>
              몰래 과자 선물하기!!
            </Text>
            <Image
              src="/images/bread-mission.png"
              alt="미션 이미지"
              mx="auto"
              maxW="120px"
              mb={4}
            />
            <LongButton onClick={() => alert('미션 완료 처리')}>
              미션 완료하기
            </LongButton>
          </>
        )}
      </CommonCard>

      {/* 메뉴 카드 */}
      <VStack w="100%" maxW="480px">
        <CommonCard onClick={prevMissionModal.onOpen}>
          이전 미션 확인하기
        </CommonCard>
        <CommonCard onClick={manitoModal.onOpen}>
          내 마니또 확인하기
        </CommonCard>
        <CommonCard onClick={voteModal.onOpen}>
          투표하기 (디스티니 공개)
        </CommonCard>
      </VStack>

      {/* 모달들 */}
      <BaseModal
        open={prevMissionModal.isOpen}
        onClose={prevMissionModal.onClose}
        title="이전 미션 확인하기"
        caption="내가 수행한 미션 목록입니다"
        body={<Text>7/28: 인사하기<br />7/29: 몰래 간식 주기</Text>}
      />
      <BaseModal
        open={manitoModal.isOpen}
        onClose={manitoModal.onClose}
        title="내 마니또 확인"
        caption="마니또는 비밀이에요 🤫"
        body={<Text>게임이 끝나면 알려드릴게요!</Text>}
      />
      <BaseModal
        open={voteModal.isOpen}
        onClose={voteModal.onClose}
        title="마니또 투표하기"
        caption="누가 내 마니또일까요?"
        body={<Text>이름을 선택해 투표하세요</Text>}
        footer={
          <HStack gap={4}>
            <LongButton onClick={voteModal.onClose}>취소</LongButton>
            <LongButton onClick={() => alert('투표 완료')}>투표하기</LongButton>
          </HStack>
        }
      />
    </VStack>
  );
};

export default GameHomePage;
