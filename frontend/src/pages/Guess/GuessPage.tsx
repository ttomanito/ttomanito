import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import ProfileCard from '@/components/profile/ProfileCard';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BaseModal from '@/components/modal/BaseModal';

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

const GuessPage = () => {
  const { roomId } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [hasGuessedToday, setHasGuessedToday] = useState<boolean>(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  console.log(myUserId)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await axios.get('/user/profile');
        setMyUserId(me.data.userId);

        const res = await axios.get(`/room/${roomId}/participants`);
        const filtered = res.data.filter((u: User) => u.userId !== me.data.userId);
        setUsers(filtered);

        const guessRes = await axios.get('/manito/guess/history');
        const today = new Date().toISOString().slice(0, 10);
        const guessedToday = guessRes.data.some(
          (g: GuessHistory) => g.guessedDate === today
        );
        setHasGuessedToday(guessedToday);
        setGuessHistory(guessRes.data);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
    };
    fetchData();
  }, [roomId]);

  const handleConfirm = () => {
    if (selectedId === null) {
      setAlertOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const handleSubmitGuess = async () => {
    try {
      await axios.post('/manito/guess', { guessedUserId: selectedId });
      setConfirmOpen(false);
      setHasGuessedToday(true);
    } catch (err) {
      console.error('추측 제출 실패:', err);
    }
  };

  const handleShowHistory = async () => {
    try {
      const res = await axios.get('/manito/guess/history');
      setGuessHistory(res.data);
      setHistoryOpen(true);
    } catch (err) {
      console.error('추측 이력 불러오기 실패:', err);
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        추측하기
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        내 마니또는 누구일까? 두근두근 알려보기
      </Text>

      <VStack gap={4} align="stretch">
        {users.map((user) => (
          <Box
            key={user.userId}
            border={selectedId === user.userId ? '2px solid #A48AFB' : '1px solid #e2e2e2'}
            borderRadius="lg"
            onClick={() => setSelectedId(user.userId)}
            cursor="pointer"
            bg={selectedId === user.userId ? 'purple.50' : 'white'}
          >
            <ProfileCard
              name={user.name}
              subtitle={user.statusMessage}
            />
          </Box>
        ))}

        <Button colorScheme="purple" onClick={handleConfirm} disabled={hasGuessedToday}>
          {hasGuessedToday ? '오늘은 이미 추측 완료' : '확인'}
        </Button>

        <Button variant="ghost" fontSize="sm" onClick={handleShowHistory}>
          ❕ 이전 추측 보기
        </Button>
      </VStack>

      {/* 모달들 */}
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
          <VStack w="full">
            <Button variant="outline" w="full" onClick={() => setConfirmOpen(false)}>
              취소하기
            </Button>
            <Button colorScheme="purple" w="full" onClick={handleSubmitGuess}>
              진행하기
            </Button>
          </VStack>
        }
      />

      <BaseModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="팀원 중 한 명을 선택해주세요"
        caption="가장 의심되는 그 분을 선택해보세요!"
      />

      <BaseModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="이전 추측보기"
        body={
          <VStack align="stretch">
            {guessHistory.map((g, i) => (
              <Flex key={i} justify="space-between">
                <Text>{g.guessedDate}</Text>
                <Text>
                  {users.find((u) => u.userId === g.guessedUserId)?.name || '알 수 없음'}
                  {g.isCorrect ? ' ✅' : ' ❌'}
                </Text>
              </Flex>
            ))}
          </VStack>
        }
      />
    </Box>
  );
};

export default GuessPage;
