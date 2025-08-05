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
import ProfileCard from '@/components/profile/ProfileCard';
import ttoma_questionmark from '@/assets/ttoma_questionmark.svg'

const GameHomePage = () => {
  const startDate = '2025-07-28'; // 방 생성일
  const endDate = '2025-08-15';  // 방 생성시 설정한 종료일

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
  const tutorialModal = useDisclosure();

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
          내 마니띠 확인하기
        </CommonCard>
        <CommonCard onClick={tutorialModal.onOpen}>
          <HStack gap={2} align="center">
    <Image src={ttoma_questionmark} alt="ttoma icon" boxSize="40px" />
    <Text fontWeight="bold">튜토리얼 다시 보기</Text>
  </HStack>
        </CommonCard>
      </VStack>

      {/* 모달들 */}
      <BaseModal
        open={prevMissionModal.open}
        onClose={prevMissionModal.onClose}
        title="이전 미션 확인하기"
        caption="내가 수행한 미션 목록입니다"
        body={<Text>7/28: 인사하기<br />7/29: 몰래 간식 주기</Text>}
      />
      <BaseModal
        open={manitoModal.open}
        onClose={manitoModal.onClose}
        title="내 마니띠 확인"
        body={<ProfileCard name="안수진" subtitle='상태메시지' title="내 마니띠" src='{src}'></ProfileCard>}
      />
      <BaseModal
        open={tutorialModal.open}
        onClose={tutorialModal.onClose}
        title="튜토리얼"
        body={<Text>마니또, 마니띠?</Text>}
      />
    </VStack>
  );
};

export default GameHomePage;
