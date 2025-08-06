import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import BaseModal from '@/components/modal/BaseModal';
import { useParams } from 'react-router-dom';
import { getRequest, postRequest } from '@/api/requests';
import { useAuth } from '@/stores/auth';
import ProfileListItem from '@/components/lists/ProfileListItem';
import { dummyParticipants } from '@/mocks/participants';
import LongButton from '@/components/buttons/LongButton';
import DoubleButton from '@/components/buttons/DoubleButton';
import BasicListItem from '@/components/lists/BasicListItem';

interface User {
  userId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
}

interface GuessHistory {
  guessedUserId: number;
  guessedDate: string;
}

const GuessPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useAuth((state) => state.user);
  const hydrated = useAuth((state) => state.hydrated);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [hasGuessedToday, setHasGuessedToday] = useState<boolean>(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setUsers(dummyParticipants);

    const fetchData = async () => {
      if (!user || !hydrated) return;

      try {
        const participants = await getRequest<User[]>(`/room/${roomId}/participants`);
        const filtered = participants.filter((u) => u.userId !== Number(user.id));
        // 이름 기준 ㄱㄴㄷ 정렬
        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setUsers(sorted);

        const guessRes = await getRequest<GuessHistory[]>('/manito/guess/history');
        const today = new Date().toISOString().slice(0, 10);
        const guessedToday = guessRes.some((g) => g.guessedDate === today);
        // 이전 추측 더미 데이터
        const dummyHistory: GuessHistory[] = [
        { guessedUserId: 1, guessedDate: '2025-08-03' },
        { guessedUserId: 3, guessedDate: '2025-08-05' },
      ];
      setGuessHistory(dummyHistory);
      // setGuessHistory(guessRes);
        setHasGuessedToday(guessedToday);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
    };

    fetchData();
  }, [roomId, user, hydrated]);

  const handleConfirm = () => {
    if (selectedId === null) {
      setAlertOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const handleSubmitGuess = async () => {
    if (selectedId === null) return;

    await postRequest('/manito/guess', {
      guessedUserId: selectedId,
    });

    setConfirmOpen(false);
    setHasGuessedToday(true);
  };

  const handleShowHistory = async () => {
    try {
      const res = await getRequest<GuessHistory[]>('/manito/guess/history');
      setGuessHistory(res);
    } catch (err) {
      console.error('추측 이력 불러오기 실패:', err);
    } finally {
        console.log('모달을 열겠습니다!'); // ✅ 디버깅
      setHistoryOpen(true); // 무조건 모달 열림
    }
  };

  if (!hydrated) return <Text>로딩 중...</Text>;

  return (
    <Box p={4}>
      <Text textStyle="title_mlg" mb={2}>
        추측하기
      </Text>
      <Text textStyle="caption_sm" color="gray.600" mb={4}>
        내 마니또는 누구일까? 두근두근 맞춰보기
      </Text>

      <VStack gap={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Text textStyle="title_md">팀원 리스트</Text>
          <Button
            variant="ghost"
            textStyle="body_sm"
            color="purple.500"
            onClick={handleShowHistory}
          >
            이전 추측 기록
          </Button>
        </Flex>

        {users.map((user) => (
          <Box
            key={user.userId}
            border={selectedId === user.userId ? '3px solid #A48AFB' : '1px solid #e2e2e2'}
            borderRadius="lg"
            onClick={() => setSelectedId(user.userId)}
            cursor="pointer"
            bg={selectedId === user.userId ? 'purple.50' : 'white'}
          >
            <ProfileListItem
              name={user.name}
              statusMessage={user.statusMessage}
            />
          </Box>
        ))}

        <LongButton
  onClick={handleConfirm}
  disabled={hasGuessedToday}
>
  {hasGuessedToday ? '오늘은 이미 추측 완료' : '확인'}
</LongButton>
      </VStack>

      {/* 선택 안 했을 때 경고 모달 */}
      <BaseModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="팀원 중 한 명을 선택해주세요"
        body={
          <Text textStyle="caption_xs_light" textAlign="center" mt={-5}>
            가장 의심되는 팀원을 선택해주세요
          </Text>
        }
      />

      {/* 추측 확인 모달 */}
      <BaseModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="추측하시겠습니까?"
        body={
          <Text>
            {users.find((u) => u.userId === selectedId)?.name}님을 마니또로 추측합니다.
          </Text>
        }
        footer={
          <DoubleButton
            leftLabel="취소"
            rightLabel="확인"
            onLeftClick={() => setConfirmOpen(false)}
            onRightClick={handleSubmitGuess}
          />
        }
      />

      {/* 추측 이력 보기 모달 */}
      <BaseModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="이전 추측 보기"
        body={
          guessHistory.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              추측 기록이 없습니다.
            </Text>
          ) : (
            <VStack align="stretch">
              {guessHistory.map((g, i) => {
                const userName = users.find((u) => u.userId === g.guessedUserId)?.name || '알 수 없음';
                const date = g.guessedDate.slice(5).replace('-', '.'); // MM.DD 포맷
                return <BasicListItem key={i} date={date} content={userName} />;
              })}
            </VStack>
          )
        }
      />
    </Box>
  );
};

export default GuessPage;
