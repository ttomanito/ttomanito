import {
  Box,
  VStack,
  Text,
  Image,
  HStack,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import CommonCard from '@/components/cards/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import ProfileCard from '@/components/profile/ProfileCard';
import ttoma_questionmark from '@/assets/ttomas/ttoma_questionmark.svg';
import ttoma_heart from '@/assets/ttomas/ttoma_heart.svg';
import ttoma_mission from '@/assets/ttomas/ttoma_mission.svg';
import ttoma_gift from '@/assets/mission_icons/ttoma_gift.svg';
import missioncard_bg from '@/assets/imgs/missioncard_bg.png';
import missioncard_bg_2 from '@/assets/imgs/missioncard_bg_2.png';
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
import { useAuth } from '@/stores/authStore'; 

const GameHomePage = () => {
  const { roomId, isInGame } = useAuth((s) => s.gameInfo);
  const hydrated = useAuth((s) => s.hydrated);
  const navigate = useNavigate();
  const { openModal, closeModal } = useModalStore();

  const [room, setRoom] = useState<{
    startDate: string;
    endDate: string;
    missionDays: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(!hydrated);
  const [isMissionRevealed, setIsMissionRevealed] = useState(false);
  const [todayMission, setTodayMission] = useState<Mission | null>(null);

  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');
  const todayDay = today.format('ddd').toUpperCase();

  // 게임 참여 상태가 아니면 메인 페이지로 리디렉션
  useEffect(() => {
    if (hydrated && !isInGame) {
      alert('참여 중인 게임이 없어 메인 페이지로 이동합니다.');
      navigate('/', { replace: true }); 
    }
  }, [hydrated, isInGame, navigate]);

  useEffect(() => {
    // 게임에 참여 중이며, roomId가 있을 때만 API를 호출
    if (hydrated && isInGame && roomId) {
      const fetchRoomInfo = async () => {
        setIsLoading(true);
        try {
          const data = await getRequest(`/room/${roomId}`);
          console.log("🏠 room data:", data);
          setRoom({
            startDate: data.startDate,
            endDate: data.endDate,
            missionDays: data.missionDays,
          });
        } catch (err) {
          console.error('방 정보 가져오기 실패:', err);
          setRoom(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoomInfo();
    } else if (hydrated) {
      // 재수화는 됐지만, 게임 참여 상태가 아닌 경우 로딩을 중단
      setIsLoading(false);
    }
  }, [hydrated, isInGame, roomId]);

  const { currentDay, totalDays } = useMemo(() => {
    if (!room) return { currentDay: 0, totalDays: 0 };
    const start = dayjs(room.startDate);
    const end = dayjs(room.endDate);
    const total = end.diff(start, 'day') + 1;
    let current = today.diff(start, 'day') + 1;
    if (current < 1) current = 1;
    if (current > total) current = total;
    return { currentDay: current, totalDays: total };
  }, [room, today]);

  const isMissionAvailable = useMemo(() => {
    if (!room) return false;
    const start = dayjs(room.startDate);
    const end = dayjs(room.endDate);
    return (
      today.isAfter(start.subtract(1, 'day')) &&
      today.isBefore(end.add(1, 'day')) &&
      room.missionDays.includes(todayDay)
    );
  }, [room, todayDay, today]);


  useEffect(() => {
    const revealed = localStorage.getItem(`mission_revealed_${todayKey}`);
    const wasRevealed = revealed === 'true';
    setIsMissionRevealed(wasRevealed);

    if (wasRevealed && !todayMission && isMissionAvailable) {
      fetchTodayMission().then(setTodayMission).catch(console.error);
    }
  }, [todayKey, isMissionAvailable, todayMission]);

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

  const missionCompleteModalData = {
    title: '오늘의 미션을 완료하셨나요?',
    caption: '미션 수행 결과는 수정이 불가능합니다.\n 신중히 선택해주세요.',
    body: (''
    ),
    footer: (
      <DoubleButton
        leftLabel="취소"
        rightLabel="확인"
        onLeftClick={closeModal}
        onRightClick={() => {
          alert('미션을 완료하였습니다 !');
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
    body: <TutorialBody />,
    footer: <LongButton onClick={closeModal}>닫기</LongButton>,
  };

  // 로딩 중이거나, 리디렉션이 아직 실행되지 않았을 때
  if (isLoading || !isInGame) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // API 호출에 실패했거나 방 정보가 없는 경우의 UI
  if (!room) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text textStyle="title_md">게임 정보를 불러오는 데 실패했습니다.</Text>
      </Flex>
    );
  }

  return (
    <VStack gap={5} align="center" w="full" m={0} p={0}>
      <Box w="full" bgImage={`url(${missioncard_bg})`} bgSize="cover" bgRepeat="no-repeat" py={20}>
        <Box maxW="480px" mx="auto" px={4}>
          <Text textStyle="title_lg" textAlign="center" mb={-2}>오늘의 미션</Text>

          <Box w="100%" mb={6}>
            <Text textStyle="body_sm" mb={2} mr={3} textAlign="end">
              {currentDay} / {totalDays}일
            </Text>
            <Box h="10px" bg="gray.200" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${totalDays > 0 ? (currentDay / totalDays) * 100 : 0}%`} bg="purple.400" transition="width 0.3s ease" />
            </Box>
          </Box>

          <CommonCard
            onClick={handleRevealMission}
            cursor={isMissionAvailable && !isMissionRevealed ? 'pointer' : 'default'}
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
