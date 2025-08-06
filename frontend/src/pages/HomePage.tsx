import {
  Box,
  VStack,
  Text,
  Image,
  HStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import CommonCard from '@/components/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import ProfileCard from '@/components/profile/ProfileCard';
import ttoma_questionmark from '@/assets/ttoma_questionmark.svg';
import { useModalStore } from '@/stores/modalStore';
import TutorialBody from '@/components/modal/TutorialBody'; // ✨ 1. 새로 만든 TutorialBody를 import

const GameHomePage = () => {
  const { openModal, closeModal } = useModalStore();

  // ... (날짜, 미션 관련 로직은 이전과 동일)
  const startDate = '2025-07-28';
  const endDate = '2025-08-15';

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

  // ✨ 1. 각 모달에 필요한 데이터를 객체로 미리 정의합니다.
  const prevMissionModalData = {
    title: '이전 미션 확인하기',
    caption: '내가 수행한 미션 목록입니다',
    body: <Text>7/28: 인사하기<br />7/29: 몰래 간식 주기</Text>,
  };

  const manitoModalData = {
    title: '내 마니띠 확인',
    body: <ProfileCard name="안수진" subtitle="상태메시지" title="내 마니띠" src='{src}' />,
  };

  const tutorialModalData = {
    title: '', 
    // body에 새로 만든 컴포넌트를 넣습니다.
    body: <TutorialBody />,
    // footer에 닫기 버튼을 직접 전달합니다.
    footer: <LongButton onClick={closeModal}>닫기</LongButton>,
  };

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
        {/* ... 미션 카드 내용 생략 ... */}
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
        {/* ✨ 2. onClick 핸들러에서 미리 정의한 객체를 전달합니다. */}
        <CommonCard onClick={() => openModal(prevMissionModalData)}>
          이전 미션 확인하기
        </CommonCard>
        <CommonCard onClick={() => openModal(manitoModalData)}>
          내 마니띠 확인하기
        </CommonCard>
        <CommonCard onClick={() => openModal(tutorialModalData)}>
          <HStack gap={2} align="center">
            <Image src={ttoma_questionmark} alt="ttoma icon" boxSize="40px" />
            <Text fontWeight="bold">튜토리얼 다시 보기</Text>
          </HStack>
        </CommonCard>
      </VStack>
    </VStack>
  );
};

export default GameHomePage;