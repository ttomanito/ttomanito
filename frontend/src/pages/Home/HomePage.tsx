import {
  Box,
  VStack,
  Text,
  Image,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import CommonCard from '@/components/cards/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import ProfileCard from '@/components/profile/ProfileCard';
import ttoma_questionmark from '@/assets/ttomas/ttoma_questionmark.svg';
import ttoma_heart from '@/assets/ttomas/ttoma_heart.svg';
import ttoma_mission from '@/assets/ttomas/ttoma_mission.svg';
import ttoma_gift from '@/assets/mission_icons/ttoma_gift.svg'
import missioncard_bg from '@/assets/imgs/missioncard_bg.png'
import missioncard_bg_2 from '@/assets/imgs/missioncard_bg_2.png'
import DoubleButton from '@/components/buttons/DoubleButton';
import { useModalStore } from '@/stores/modalStore';
import TutorialBody from '@/components/modal/TutorialBody';
import { fetchTodayMission, type Mission } from '@/api/mission';
import { getRequest } from '@/api/requests';
import easy from '@/assets/mission_icons/stars/easy.svg';
import normal from '@/assets/mission_icons/stars/normal.svg';
import hard from '@/assets/mission_icons/stars/hard.svg';
import veryHard from '@/assets/mission_icons/stars/veryhard.svg';
import ttoma_communication from '@/assets/mission_icons/ttoma_communication.svg';
import ttoma_notes from '@/assets/mission_icons/ttoma_notes.svg';
import ttoma_observation from '@/assets/mission_icons/ttoma_observation.svg';
import ttoma_performance from '@/assets/mission_icons/ttoma_performance.svg';

const GameHomePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { openModal, closeModal } = useModalStore();

  const [room, setRoom] = useState<{
    startDate: string;
    endDate: string;
    missionDays: string[];
  } | null>(null);

  const [isMissionRevealed, setIsMissionRevealed] = useState(false);
  const [todayMission, setTodayMission] = useState<Mission | null>(null);

  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');
  const todayDay = today.format('ddd').toUpperCase(); // 'MON', 'TUE' 등으로 변환

  const isMissionAvailable = useMemo(() => {
    if (!room) return false;
    const start = dayjs(room.startDate);
    const end = dayjs(room.endDate);
    return (
      today.isAfter(start.subtract(1, 'day')) &&
      today.isBefore(end.add(1, 'day')) &&
      room.missionDays.includes(todayDay)
    );
  }, [room, todayDay]);

  const { currentDay, totalDays } = useMemo(() => {
    if (!room) return { currentDay: 0, totalDays: 0 };
    const start = dayjs(room.startDate);
    const end = dayjs(room.endDate);
    const total = end.diff(start, 'day') + 1;
    let current = today.diff(start, 'day') + 1;
    if (current < 1) current = 1;
    if (current > total) current = total;
    return { currentDay: current, totalDays: total };
  }, [room]);

  const getDifficultyImage = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'EASY': return easy;
      case 'NORMAL': return normal;
      case 'HARD': return hard;
      case 'VERY_HARD': return veryHard;
      default: return easy;
    }
  };

  const getTypeImage = (type: Mission['type']) => {
    switch (type) {
      case 'GIFT': return ttoma_gift;
      case 'NOTES': return ttoma_notes;
      case 'COMMUNICATION': return ttoma_communication;
      case 'OBSERVATION': return ttoma_observation;
      case 'PERFORMANCE': return ttoma_performance;
      default: return ttoma_heart;
    }
  };

  useEffect(() => {
  const fetchRoomInfo = async () => {
    try {
      const data = await getRequest(`/room/${roomId}`);
      console.log("🏠 room data:", data); // 이 로그 반드시 확인
      setRoom({
        startDate: data.startDate,
        endDate: data.endDate,
        missionDays: data.missionDays,
      });
    } catch (err) {
      console.error('방 정보 가져오기 실패:', err);
    }
  };

  fetchRoomInfo();
}, [roomId]);

  console.log('startDate:', room?.startDate);
console.log('endDate:', room?.endDate);


  useEffect(() => {
    const revealed = localStorage.getItem(`mission_revealed_${todayKey}`);
    const wasRevealed = revealed === 'true';
    setIsMissionRevealed(wasRevealed);

    if (wasRevealed && !todayMission && isMissionAvailable) {
      fetchTodayMission().then(setTodayMission).catch(console.error);
    }
  }, [todayKey, isMissionAvailable]);

  const handleRevealMission = async () => {
    if (isMissionRevealed || !isMissionAvailable) return;
    try {
      const mission = await fetchTodayMission();
      setTodayMission(mission);
      localStorage.setItem(`mission_revealed_${todayKey}`, 'true');
      setIsMissionRevealed(true);
    } catch (err) {
      console.error('미션 가져오기 실패:', err);
      alert('미션을 불러오지 못했습니다.');
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
      <Box w="full" bgImage={`url(${missioncard_bg})`} bgSize="cover" bgRepeat="no-repeat" py={20}>
        <Box maxW="480px" mx="auto" px={4}>
          <Text textStyle="title_lg" textAlign="center" mb={-2}>오늘의 미션</Text>

          {room && (
            <Box w="100%" mb={6}>
              <Text textStyle="body_sm" mb={2} mr={3} textAlign="end">
                {currentDay} / {totalDays}일
              </Text>
              <Box h="10px" bg="gray.200" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${(currentDay / totalDays) * 100}%`} bg="purple.400" transition="width 0.3s ease" />
              </Box>
            </Box>
          )}

          <CommonCard
            onClick={handleRevealMission}
            cursor={!isMissionRevealed ? 'pointer' : 'default'}
            h="360px"
          >
            <Flex direction="column" justify="center" align="center" h="100%" w="100%" bgImage={!isMissionRevealed ? `url("${missioncard_bg_2}")` : undefined} bgSize="cover" bgRepeat="no-repeat" borderRadius="inherit">
              {!isMissionAvailable ? (
                <>
                  <Text textStyle="title_lg" textAlign="center" mb={2}>오늘은 미션이 없습니다</Text>
                  <Text textStyle="caption_xs_light" textAlign="center">다음 미션 요일을 기다려주세요!</Text>
                </>
              ) : !isMissionRevealed || !todayMission ? (
                <>
                  <Text textStyle="title_lg" textAlign="center" mb={2}>???</Text>
                  <Text textStyle="caption_xs_light" textAlign="center">클릭해서 오늘의 미션을 확인해주세요</Text>
                </>
              ) : (
                <>
                  <Image src={getDifficultyImage(todayMission.difficulty)} alt={todayMission.difficulty} mx="auto" maxW="120px" mb={4} />
                  <Text textStyle="title_ml" textAlign="center" mb={1}>{todayMission.title}</Text>
                  <Text textStyle="caption_xs_light" textAlign="center">{todayMission.description ?? ""}</Text>
                  <Image src={getTypeImage(todayMission.type)} alt={todayMission.type} mx="auto" maxW="120px" mb={4} />
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
