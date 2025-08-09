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
import dayjs from 'dayjs';
import CommonCard from '@/components/cards/CommonCard';
import LongButton from '@/components/buttons/LongButton';
import ProfileCard from '@/components/profile/ProfileCard';
import MissionListItem from '@/components/lists/MissionListItem';
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
import { getRequest, patchRequest } from '@/api/requests';
import easy from '@/assets/mission_icons/stars/easy.svg';
import normal from '@/assets/mission_icons/stars/normal.svg';
import hard from '@/assets/mission_icons/stars/hard.svg';
import veryHard from '@/assets/mission_icons/stars/veryhard.svg';
import ttoma_communication from '@/assets/mission_icons/ttoma_communication.svg';
import ttoma_notes from '@/assets/mission_icons/ttoma_notes.svg';
import ttoma_observation from '@/assets/mission_icons/ttoma_observation.svg';
import ttoma_performance from '@/assets/mission_icons/ttoma_performance.svg';
import { useAuth } from '@/stores/authStore';
import ttoma_profile from '@/assets/ttomas/ttoma_profile.png';

// 타입 정의
interface Participant {
  userId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
  profileImageUrl?: string;
}

interface PastMission {
  missionId: number;
  missionStatusId: number | null;
  title: string;
  description: string | null;
  difficulty: string;
  missionDate: string;
  completed: boolean;
  channels: string[];
  type: string;
}

// 데이터를 직접 불러오는 컨테이너 컴포넌트
const PastMissionsList = () => {
  const [missions, setMissions] = useState<PastMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionList = await getRequest<PastMission[]>('/manito/mission/missionlist');
        setMissions(missionList);
      } catch (err) {
        console.error('이전 미션 목록 가져오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMissions();
  }, []);

  if (isLoading) {
    return <Flex justify="center" align="center" h="200px"><Spinner size="lg" /></Flex>;
  }
  if (missions.length === 0) {
    return <Flex justify="center" align="center" h="100px"><Text textStyle="body_md">아직 수행한 미션이 없습니다.</Text></Flex>;
  }

  return (
    <VStack gap={2} maxH="400px" overflowY="auto">
      {missions.map((mission) => (
        <MissionListItem
          key={mission.missionId}
          date={dayjs(mission.missionDate).format('MM/DD')}
          content={mission.title}
          completed={mission.completed}
        />
      ))}
    </VStack>
  );
};


// 메인 페이지 컴포넌트
const GameHomePage = () => {
  // ⚠️ 테스트를 위한 하드코딩
  const isInGame = true;
  const roomId = '2';

  const hydrated = useAuth((s) => s.hydrated);
  const { openModal, closeModal } = useModalStore();

  const [room, setRoom] = useState<{
    startDate: string;
    endDate: string;
    missionDays: string[];
  } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(!hydrated);
  
  const [todayMission, setTodayMission] = useState<Mission | null>(null);
  const [isMissionRevealed, setIsMissionRevealed] = useState(false);
  const [isMissionCompletedToday, setIsMissionCompletedToday] = useState(false);

  const [manitoProfile, setManitoProfile] = useState<Participant | null>(null);
  const [isFetchingManito, setIsFetchingManito] = useState(false);

  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');
  const todayDay = today.format('ddd').toUpperCase();

  useEffect(() => {
    if (!hydrated) return;
    if (isInGame && roomId) {
      const fetchGameData = async () => {
        setIsPageLoading(true);
        try {
          const [roomData, participantsData] = await Promise.all([
            getRequest(`/room/${roomId}`),
            getRequest<Participant[]>(`/room/${roomId}/participants`),
          ]);
          setRoom(roomData);
          setParticipants(participantsData);
        } catch (err) {
          console.error('게임 데이터 가져오기 실패:', err);
        } finally {
          setIsPageLoading(false);
        }
      };
      fetchGameData();
    } else {
      setIsPageLoading(false);
    }
  }, [hydrated, roomId, isInGame]);

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
    const completed = localStorage.getItem(`mission_completed_${todayKey}`);
    if (revealed === 'true' && !todayMission && isMissionAvailable) {
      fetchTodayMission()
        .then(mission => {
            setTodayMission(mission);
            if (mission.completed || completed === 'true') {
                setIsMissionCompletedToday(true);
            }
        })
        .catch(console.error);
    }
    setIsMissionRevealed(revealed === 'true');
    setIsMissionCompletedToday(completed === 'true');
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
    }
  };

  const handleCompleteMission = async () => {
    if (!todayMission?.missionStatusId) return;
    try {
      await patchRequest(`/manito/mission/${todayMission.missionStatusId}/success`, {});
      alert('미션을 완료하였습니다!');
      localStorage.setItem(`mission_completed_${todayKey}`, 'true');
      setIsMissionCompletedToday(true);
      closeModal();
    } catch (err) {
      console.error('미션 완료 처리 실패:', err);
    }
  };
  
  // ✅ [수정됨] 마니띠 정보 확인 핸들러 로직 수정
  const handleShowManito = async () => {
    openModal(manitoModalData);
    setIsFetchingManito(true);
    setManitoProfile(null); // 프로필 상태 초기화
    try {
      // 1. API가 숫자(number)를 반환한다고 가정하고 바로 변수에 할당
      const manitoId = await getRequest<number>(`/manito/manitee`);
      const foundManito = participants.find(p => p.userId === manitoId);

      if (foundManito) {
        setManitoProfile(foundManito);
      } else {
        // 2. 마니띠를 못 찾아도 에러를 발생시키지 않고, 콘솔에만 기록
        console.error(`참여자 목록에 마니띠 ID(${manitoId})가 존재하지 않습니다.`);
      }
    } catch (err) {
      // 3. 네트워크 등 실제 에러가 발생했을 때만 콘솔에 기록
      console.error('마니띠 정보를 불러오는 중 에러 발생:', err);
    } finally {
      setIsFetchingManito(false);
    }
  };

  const handleShowPastMissions = () => {
    openModal({
      title: '이전 미션 확인하기',
      caption: '내가 수행한 미션 목록입니다',
      body: <PastMissionsList />,
    });
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

  // ✅ [수정됨] 마니띠를 찾지 못했을 때의 메시지 추가
  const ManitoProfileModalBody = () => {
    if (isFetchingManito) {
      return <Flex justify="center" align="center" h="150px"><Spinner size="lg" /></Flex>;
    }
    if (manitoProfile) {
      return <ProfileCard title="내 마니띠" name={manitoProfile.name} subtitle={manitoProfile.statusMessage} src={manitoProfile.profileImageUrl || ttoma_profile} />;
    }
    // 로딩이 끝났는데 manitoProfile이 여전히 null이면 이 메시지를 표시
    return <Flex justify="center" align="center" h="100px"><Text textStyle="body_md">마니띠 정보를 찾을 수 없습니다.</Text></Flex>;
  };
  
  const missionCompleteModalData = {
    title: '오늘의 미션을 완료하셨나요?',
    caption: '미션 수행 결과는 수정이 불가능합니다.\n 신중히 선택해주세요.',
    body: (''),
    footer: ( <DoubleButton leftLabel="취소" rightLabel="확인" onLeftClick={closeModal} onRightClick={handleCompleteMission} /> ),
  };
  const manitoModalData = { title: '내 마니띠 확인', body: <ManitoProfileModalBody />, };
  const tutorialModalData = { title: '', body: <TutorialBody />, footer: <LongButton onClick={closeModal}>닫기</LongButton>, };

  if (isPageLoading) {
    return ( <Flex justify="center" align="center" h="100vh"><Spinner size="xl" /></Flex> );
  }

  if (!isInGame || !room) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text textStyle="title_sm">참여중인 게임이 없거나, 정보를 불러올 수 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <VStack gap={5} align="center" w="full" m={0} p={0}>
      <Box w="full" bgImage={`url(${missioncard_bg})`} bgSize="cover" bgRepeat="no-repeat" py={20}>
        <Box maxW="480px" mx="auto" px={4}>
          <Text textStyle="title_lg" textAlign="center" mb={-2}>오늘의 미션</Text>
          <Box w="100%" mb={6}>
            <Text textStyle="body_sm" mb={2} mr={3} textAlign="end">{currentDay} / {totalDays}일</Text>
            <Box h="10px" bg="gray.200" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${totalDays > 0 ? (currentDay / totalDays) * 100 : 0}%`} bg="purple.400" transition="width 0.3s ease" />
            </Box>
          </Box>
          <CommonCard onClick={handleRevealMission} cursor={isMissionAvailable && !isMissionRevealed ? 'pointer' : 'default'} h="360px">
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
                  <LongButton onClick={(e) => { e.stopPropagation(); openModal(missionCompleteModalData); }} disabled={isMissionCompletedToday}>
                    {isMissionCompletedToday ? '오늘의 미션 완료됨' : '미션 완료!'}
                  </LongButton>
                </>
              )}
            </Flex>
          </CommonCard>
        </Box>
      </Box>

      <VStack gap={3} w="100%" maxW="480px" pb={5}>
        <CommonCard onClick={handleShowPastMissions}>
          <HStack gap={2} align="center">
            <Image src={ttoma_mission} alt="ttoma icon" boxSize="40px" />
            <VStack gap={1} align="start">
              <Text textStyle="body_sm">이전 미션 확인하기</Text>
              <Text textStyle="caption_xs_light">지난 미션 기록을 확인해보세요</Text>
            </VStack>
          </HStack>
        </CommonCard>
        <CommonCard onClick={handleShowManito}>
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