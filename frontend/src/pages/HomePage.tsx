import {
  Box,
  VStack,
  Text,
  Image,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import CommonCard from '@/components/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import ProfileCard from '@/components/profile/ProfileCard';
import ttoma_questionmark from '@/assets/ttoma_questionmark.svg'
import ttoma_heart from '@/assets/ttoma_heart.svg'
import ttoma_mission from '@/assets/ttoma_mission.svg'
import ttoma_gift from '@/assets/mission_icons/ttoma_gift.svg'
import easy from '@/assets/mission_icons/stars/easy.svg'
import missioncard_bg from '@/assets/imgs/missioncard_bg.png'
import DoubleButton from '@/components/buttons/DoubleButton';
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
  const missionCompleteModalData = {
    title: '오늘의 미션을 완료하셨나요?',
    caption: '미션 수행 결과는 수정이 불가능합니다.\n 신중히 선택해주세요.',
    body: (''
    ),
    footer: (
      <DoubleButton
        leftLabel="취소"
        rightLabel="확인"
        // ✨ missionCompleteModal.onClose 대신 closeModal을 사용합니다.
        onLeftClick={closeModal}
        onRightClick={() => {
          alert('미션을 완료하였습니다 !');
          // ✨ missionCompleteModal.onClose 대신 closeModal을 사용합니다.
          closeModal();
        }}
      />
    ),
  };
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
    <VStack gap={5} align="center" w="full" m={0} p={0}>
  {/* 배경 전체 */}
  <Box
    w="full"
    bgImage={`url(${missioncard_bg})`}
    bgSize="cover"
    bgRepeat="no-repeat"
    py={6}
  >
    <Box maxW="480px" mx="auto" px={4}>
      <Text textStyle="title_lg" textAlign="center" mb={-5}>
        오늘의 미션
      </Text>

      <Box w="100%">
        <Text textStyle="body_sm" mb={1} mr={3} textAlign="end">
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
        h="360px"
      >
        <Flex
          direction="column"
          justify="center"
          align="center"
          h="100%"
          w="100%"
          bgImage={isMissionRevealed ? undefined : `url("${missioncard_bg}")`}
          bgSize="cover"
          bgRepeat="no-repeat"
          borderRadius="inherit"
        >
          {!isMissionRevealed ? (
            <>
              <Text textStyle="title_lg" textAlign="center" mb={2}>???</Text>
              <Text textStyle="caption_xs_light" textAlign="center">
                클릭해서 오늘의 미션을 확인해주세요
              </Text>
            </>
          ) : (
            <>
              <Image src={easy} alt="난이도" mx="auto" maxW="120px" mb={4} />
              <Text textStyle="title_ml" textAlign="center" mb={1}>
                마니띠 몰래 과자 선물하기
              </Text>
              <Text textStyle="caption_xs_light" textAlign="center">
                마니띠 몰래 과자 선물하기
              </Text>
              <Image src={ttoma_gift} alt="미션 이미지" mx="auto" maxW="120px" mb={4} />
              <LongButton onClick={() => openModal(missionCompleteModalData)}>미션 완료!</LongButton>
            </>
          )}
        </Flex>
      </CommonCard>
    </Box>
  </Box>


      {/* 메뉴 카드 */}
      <VStack gap={3} w="100%" maxW="480px">
        <CommonCard onClick={() => openModal(prevMissionModalData)}>
          <HStack gap={2} align="center">
          <Image src={ttoma_mission} alt="ttoma icon" boxSize="40px" />
            <VStack gap={1} align="start">
          <Text textStyle="body_sm">이전 미션 확인하기</Text>
          <Text textStyle="caption_xs_light">지난 미션 기록을 확인해보세요</Text>
            </VStack>
          </HStack>
        </CommonCard>
        <CommonCard onClick={() => openModal(manitoModalData)}>
          <HStack gap={2} align="center">
          <Image src={ttoma_heart} alt="ttoma icon" boxSize="40px" />
            <VStack gap={1} align="start">
          <Text textStyle="body_sm">내 마니띠 확인하기</Text>
          <Text textStyle="caption_xs_light">내 마니띠가 누구인지 다시 확인해보세요</Text>
            </VStack>
          </HStack>
        </CommonCard>
        <CommonCard onClick={() => openModal(tutorialModalData)}>
          <HStack gap={2} align="center">
          <Image src={ttoma_questionmark} alt="ttoma icon" boxSize="40px" />
            <VStack gap={1} align="start">
          <Text textStyle="body_sm">튜토리얼 다시 보기</Text>
          <Text textStyle="caption_xs_light">필요할 때 언제든 튜토리얼을 다시 볼 수 있어요</Text>
            </VStack>
          </HStack>
        </CommonCard>
      </VStack>
    </VStack>
  );
};

export default GameHomePage;