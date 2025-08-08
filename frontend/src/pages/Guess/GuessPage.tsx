import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ✨ 1. useParams import 추가
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
// ✨ 2. useToast를 @chakra-ui/react에서 분리
import { useToast } from '@chakra-ui/toast';

// 컴포넌트 및 유틸리티 import
import BaseModal from '@/components/modal/BaseModal';
import { getRequest, postRequest } from '@/api/requests';
import { useAuth } from '@/stores/authStore';
import ProfileListItem from '@/components/lists/ProfileListItem';
import ProfileCard from '@/components/profile/ProfileCard';
import LongButton from '@/components/buttons/LongButton';
import DoubleButton from '@/components/buttons/DoubleButton';
import BasicListItem from '@/components/lists/BasicListItem';
import ttoma_profile from '@/assets/ttomas/ttoma_profile.png'; // 기본 아바타 이미지

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

const GuessPage = () => {
  // ✨ 3. 스토어 구조에 맞게 상태 가져오기
  const { roomId } = useParams<{ roomId: string }>();
  const { user, hydrated, isAuthenticated } = useAuth();
  const toast = useToast();

  // --- 상태 관리 ---
  const [allParticipants, setAllParticipants] = useState<User[]>([]);
  const [usersToGuess, setUsersToGuess] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- 데이터 로딩 useEffect ---
  useEffect(() => {
    // ✨ 4. 인증 상태 및 유저 정보 확인 로직 강화
    if (!hydrated || !isAuthenticated || !user) {
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

        // ✨ 5. user.id를 사용하도록 수정
        const filtered = participants.filter((u) => u.userId !== Number(user.id));
        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        
        setUsersToGuess(sorted);
        setGuessHistory(fetchedHistory);

      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
        toast({
          title: '데이터를 불러올 수 없습니다.',
          description: '네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.',
          status: 'error', duration: 5000, isClosable: true, position: 'top',
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [roomId, user, hydrated, isAuthenticated, toast]); // ✨ 6. 의존성 배열 수정

  // --- 파생 상태 (Derived State) ---
  const todayString = new Date().toISOString().slice(0, 10);
  const todaysGuess = guessHistory.find(g => g.guessedDate === todayString);
  const hasGuessedToday = !!todaysGuess;
  const guessedUserToday = todaysGuess
    ? allParticipants.find(u => u.userId === todaysGuess.guessedUserId)
    : null;

  // --- 핸들러 함수 (내부 로직 변경 없음) ---
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

  // ✨ 7. 인증되지 않았거나, 데이터를 못불러온 경우에 대한 처리 강화
  if (!isAuthenticated || allParticipants.length === 0) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text textStyle="title_sm">참여중인 게임이 아니거나, 정보를 불러올 수 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Text textStyle="title_mlg" mb={2}>추측하기</Text>
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
          >
            {/* 🚨 중요: 아래 `src` prop 에러를 해결하려면 
              `ProfileListItem.tsx` 파일의 `ProfileListItemProps` 타입에 `src?: string;`를 추가해야 합니다.
            */}
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
      <BaseModal open={alertOpen} onClose={() => setAlertOpen(false)} title="팀원 중 한 명을 선택해주세요" body={<Text textStyle="caption_xs_light" textAlign="center" mt={-5}>가장 의심되는 팀원을 선택해주세요</Text>} />
      <BaseModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="추측하시겠습니까?" body={<Text>{allParticipants.find((u) => u.userId === selectedId)?.name}님을 마니또로 추측합니다.</Text>} footer={<DoubleButton leftLabel="취소" rightLabel="확인" onLeftClick={() => setConfirmOpen(false)} onRightClick={handleSubmitGuess} />} />
      <BaseModal open={historyOpen} onClose={() => setHistoryOpen(false)} title="이전 추측 보기" body={
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
      } />
    </Box>
  );
};

export default GuessPage;