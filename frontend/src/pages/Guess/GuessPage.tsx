import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast'
import BaseModal from '@/components/modal/BaseModal';
import { getRequest, postRequest } from '@/api/requests';
import { useAuth } from '@/stores/authStore';
import ProfileListItem from '@/components/lists/ProfileListItem';
import ProfileCard from '@/components/profile/ProfileCard';
import LongButton from '@/components/buttons/LongButton';
import DoubleButton from '@/components/buttons/DoubleButton';
import BasicListItem from '@/components/lists/BasicListItem';
import ttoma_profile from '@/assets/ttomas/ttoma_profile.png';

// --- API 응답에 맞춘 인터페이스 정의 ---
interface User {
  userId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
  profileImageUrl?: string;
}

interface GuessHistory {
  guessedUserId: number;
  guessedDate: string;
  isCorrect: boolean;
}

interface GuessPostResponse {
  isCorrect: boolean;
}

/**
 * GuessPage 컴포넌트
 * - 현재 참여 중인 게임 방의 다른 참여자들을 대상으로 마니또를 추측하는 페이지입니다.
 * - authStore에서 실제 게임 참여 상태(isInGame)와 방 ID(roomId)를 가져와 사용합니다.
 */
const GuessPage = () => {
  // ✨ 디버깅을 위해 게임 참여 상태와 roomId를 강제로 설정합니다.
  // ✨ 실제 앱에서는 이 부분을 지우고 authStore의 gameInfo를 사용해야 합니다.
  const isInGame = true;
  const roomId = '2';
  const { user, hydrated } = useAuth();

  // ✅ isAuthenticated를 제거하고, gameInfo에서 필요한 값만 가져옵니다.
  // const { user, hydrated, gameInfo } = useAuth();
  // const { isInGame, roomId } = gameInfo;
  const toast = useToast();

  // --- 상태 관리 ---
  const [allParticipants, setAllParticipants] = useState<User[]>([]);
  const [usersToGuess, setUsersToGuess] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // 모달 표시 여부 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- 데이터 로딩 useEffect ---
  useEffect(() => {
    // ✅ isAuthenticated 확인 로직을 제거하고, isInGame만으로 판단합니다.
    if (!hydrated || !user || !isInGame || !roomId) {
      setIsPageLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        const [participants, fetchedHistory] = await Promise.all([
          getRequest<User[]>(`/room/${roomId}/participants`),
          getRequest<GuessHistory[]>('/manito/guess/history'),
        ]);

        setAllParticipants(participants);

        const filtered = participants.filter((u) => u.userId !== Number(user.id));
        const sorted = [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'ko'));
        
        setUsersToGuess(sorted);
        setGuessHistory(fetchedHistory);

      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
        toast({
          title: '데이터를 불러올 수 없습니다.',
          description: '네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [isInGame, roomId, user, hydrated, toast]); // ✅ 의존성 배열에서 isAuthenticated 제거

  // --- 파생 상태 (Derived State) ---
  const todayString = new Date().toISOString().slice(0, 10);
  const todaysGuess = guessHistory.find(g => g.guessedDate === todayString);
  const hasGuessedToday = !!todaysGuess;
  const guessedUserToday = todaysGuess
    ? allParticipants.find(u => u.userId === todaysGuess.guessedUserId)
    : null;

  // --- 핸들러 함수 (이하 로직은 기존과 동일) ---
  const handleSelect = (userId: number) => {
    if (hasGuessedToday) return;
    setSelectedId(userId);
  };

  const handleConfirm = () => {
    if (selectedId === null) {
      setAlertOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const handleSubmitGuess = async () => {
    if (selectedId === null) return;
    try {
      const response = await postRequest<GuessPostResponse>('/manito/guess', { guessedUserId: selectedId });
      const newGuess: GuessHistory = {
        guessedUserId: selectedId,
        guessedDate: todayString,
        isCorrect: response.isCorrect,
      };
      setGuessHistory(prevHistory => [...prevHistory, newGuess]);
      setConfirmOpen(false);
      setSelectedId(null);
      toast({ title: '추측이 완료되었습니다!', status: 'success', duration: 3000, isClosable: true, position: 'top' });
    } catch (err) {
      console.error('추측 제출 실패:', err);
      toast({ title: '추측 제출에 실패했습니다.', status: 'error', duration: 4000, isClosable: true, position: 'top' });
    }
  };

  const handleShowHistory = () => { setHistoryOpen(true); };

  // --- 렌더링 로직 ---
  if (!hydrated || isPageLoading) {
    return <Flex justify="center" align="center" h="100vh"><Spinner /></Flex>;
  }

  // ✅ 사용자가 게임에 참여 중이 아닐 때의 화면을 렌더링합니다.
  if (!isInGame) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text textStyle="title_sm">참여중인 게임이 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <Box p={4} m={4}>
      <Text textStyle="title_mlg" mb={2}>✪ 추측하기</Text>
      <Text textStyle="caption_sm" color="gray.600" mb={4}>내 마니또는 누구일까? 두근두근 맞춰보기</Text>

      <VStack gap={4} align="stretch">
        {hasGuessedToday && guessedUserToday && (
          <ProfileCard
            title="오늘 내가 추측한 마니또"
            name={guessedUserToday.name}
            subtitle={guessedUserToday.statusMessage}
            src={guessedUserToday.profileImageUrl || ttoma_profile}
          />
        )}

        <Flex justify="space-between" align="center">
          <Text textStyle="title_md">팀원 리스트</Text>
          <Button variant="ghost" textStyle="body_sm" color="purple.500" onClick={handleShowHistory}>
            이전 추측 기록
          </Button>
        </Flex>

        {usersToGuess.map((participant) => (
          <Box
            key={participant.userId}
            border={!hasGuessedToday && selectedId === participant.userId ? '3px solid #A48AFB' : '1px solid #e2e2e2'}
            borderRadius="lg"
            onClick={() => handleSelect(participant.userId)}
            cursor={hasGuessedToday ? 'not-allowed' : 'pointer'}
            bg={!hasGuessedToday && selectedId === participant.userId ? 'purple.50' : 'white'}
            transition="all 0.2s"
            _hover={!hasGuessedToday ? { borderColor: 'purple.300', bg: 'purple.50' } : {}}
          >
            <ProfileListItem
              name={participant.name}
              statusMessage={participant.statusMessage}
            />
          </Box>
        ))}

        <LongButton onClick={handleConfirm} disabled={hasGuessedToday || usersToGuess.length === 0}>
          {hasGuessedToday ? '오늘은 이미 추측 완료' : '이 사람으로 추측하기'}
        </LongButton>
      </VStack>

      {/* --- 모달 섹션 --- */}
      <BaseModal 
        open={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="팀원 중 한 명을 선택해주세요" 
        body={<Text textStyle="caption_xs_light" textAlign="center" mt={-5}>가장 의심되는 팀원을 선택해주세요</Text>} 
      />
      <BaseModal 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        title="추측하시겠습니까?" 
        body={<Text>{allParticipants.find((u) => u.userId === selectedId)?.name}님을 마니또로 추측합니다.</Text>} 
        footer={<DoubleButton leftLabel="취소" rightLabel="확인" onLeftClick={() => setConfirmOpen(false)} onRightClick={handleSubmitGuess} />} 
      />
      <BaseModal 
        open={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        title="이전 추측 보기" 
        body={
          guessHistory.length === 0 ? (
            <Text textAlign="center" color="gray.500">추측 기록이 없습니다.</Text>
          ) : (
            <VStack align="stretch" gap={2}>
              {guessHistory.map((g) => {
                const guessedUser = allParticipants.find((u) => u.userId === g.guessedUserId);
                return (
                  <BasicListItem key={g.guessedDate} date={g.guessedDate.slice(5).replace('-', '.')} content={guessedUser?.name || '알 수 없음'} />
                );
              })}
            </VStack>
          )
        } 
      />
    </Box>
  );
};

export default GuessPage;
