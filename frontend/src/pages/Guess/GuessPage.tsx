import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
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

// --- API 응답에 맞춘 인터페이스 정의 ---
interface User {
  userId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
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
  const { roomId } = useParams<{ roomId: string }>();
  const user = useAuth((state) => state.user);
  const hydrated = useAuth((state) => state.hydrated);
  const toast = useToast();

  // --- 상태 관리 ---
  const [allParticipants, setAllParticipants] = useState<User[]>([]);
  const [usersToGuess, setUsersToGuess] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- 데이터 로딩 useEffect ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !hydrated) return;
      setIsLoading(true);

      try {
        const [participants, fetchedHistory] = await Promise.all([
          getRequest<User[]>(`/room/${roomId}/participants`),
          getRequest<GuessHistory[]>('/manito/guess/history'),
        ]);

        setAllParticipants(participants);

        const filtered = participants.filter((u) => u.userId !== Number(user.id));
        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        
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
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, user, hydrated, toast]);

  // --- 파생 상태 (Derived State) ---
  const todayString = new Date().toISOString().slice(0, 10);
  const todaysGuess = guessHistory.find(g => g.guessedDate === todayString);
  const hasGuessedToday = !!todaysGuess;
  const guessedUserToday = todaysGuess
    ? allParticipants.find(u => u.userId === todaysGuess.guessedUserId)
    : null;

  // --- 핸들러 함수 ---
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
      const response = await postRequest<GuessPostResponse>('/manito/guess', {
        guessedUserId: selectedId,
      });

      const newGuess: GuessHistory = {
        guessedUserId: selectedId,
        guessedDate: todayString,
        isCorrect: response.isCorrect,
      };

      setGuessHistory(prevHistory => [...prevHistory, newGuess]);
      
      setConfirmOpen(false);
      setSelectedId(null);

      toast({
        title: '추측이 완료되었습니다!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

    } catch (err) {
      console.error('추측 제출 실패:', err);
      toast({
        title: '추측 제출에 실패했습니다.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleShowHistory = () => {
    setHistoryOpen(true);
  };

  // --- 렌더링 로직 ---
  if (!hydrated || isLoading) {
    return <Flex justify="center" align="center" h="100vh"><Spinner /></Flex>;
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
          />
        )}

        <Flex justify="space-between" align="center">
          <Text textStyle="title_md">팀원 리스트</Text>
          <Button variant="ghost" textStyle="body_sm" color="purple.500" onClick={handleShowHistory}>
            이전 추측 기록
          </Button>
        </Flex>

        {usersToGuess.length > 0 ? (
          usersToGuess.map((participant) => (
            <Box
              key={participant.userId}
              border={!hasGuessedToday && selectedId === participant.userId ? '3px solid #A48AFB' : '1px solid #e2e2e2'}
              borderRadius="lg"
              onClick={() => handleSelect(participant.userId)}
              cursor={hasGuessedToday ? 'default' : 'pointer'}
              bg={!hasGuessedToday && selectedId === participant.userId ? 'purple.50' : 'white'}
            >
              <ProfileListItem name={participant.name} statusMessage={participant.statusMessage} />
            </Box>
          ))
        ) : (
          <Text textAlign="center" color="gray.500" py={10}>추측할 다른 참여자가 없습니다.</Text>
        )}

        <LongButton onClick={handleConfirm} disabled={hasGuessedToday || usersToGuess.length === 0}>
          {hasGuessedToday ? '오늘은 이미 추측 완료' : '확인'}
        </LongButton>
      </VStack>

      {/* --- 모달 섹션 --- */}
      <BaseModal open={alertOpen} onClose={() => setAlertOpen(false)} title="팀원 중 한 명을 선택해주세요" body={<Text textStyle="caption_xs_light" textAlign="center" mt={-5}>가장 의심되는 팀원을 선택해주세요</Text>} />

      <BaseModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="추측하시겠습니까?" body={<Text>{allParticipants.find((u) => u.userId === selectedId)?.name}님을 마니또로 추측합니다.</Text>} footer={<DoubleButton leftLabel="취소" rightLabel="확인" onLeftClick={() => setConfirmOpen(false)} onRightClick={handleSubmitGuess} />} />

      <BaseModal open={historyOpen} onClose={() => setHistoryOpen(false)} title="이전 추측 보기" body={
        guessHistory.length === 0 ? (
          <Text textAlign="center" color="gray.500">추측 기록이 없습니다.</Text>
        ) : (
          <VStack align="stretch">
            {guessHistory.map((g, i) => {
              const userName = allParticipants.find((u) => u.userId === g.guessedUserId)?.name || '알 수 없음';
              const date = g.guessedDate.slice(5).replace('-', '.');
              // ✅ isCorrect 결과를 보여주던 Tag를 제거하고 BasicListItem만 렌더링합니다.
              return (
                <BasicListItem key={i} date={date} content={userName} />
              );
            })}
          </VStack>
        )
      } />
    </Box>
  );
};

export default GuessPage;