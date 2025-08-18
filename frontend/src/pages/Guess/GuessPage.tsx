import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
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

type GuessPostResponse = boolean;

// /room/{roomId} 응답 (Swagger 예시 기준)
interface RoomInfo {
  roomId: number;
  creatorId: number;
  name: string;
  status: string;
  startDate: string; // "YYYY-MM-DD" or ISO
  endDate: string;   // "YYYY-MM-DD" or ISO
  missionDays: string[];
}

// KST "YYYY-MM-DD"
const toKstYMD = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);

// 서버/DB 날짜 문자열을 KST 기준 "YYYY-MM-DD"로 정규화
const normalizeGuessYMD_KST = (s?: string) => {
  if (!s) return '';
  // 이미 YYYY-MM-DD면 그대로
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO-like인데 TZ 없으면 Z를 붙여 UTC로 간주
  const hasTZ = /(Z|[+-]\d{2}:\d{2})$/.test(s);
  const dt = new Date(hasTZ ? s : s + 'Z');

  // 파싱 실패 시 안전하게 앞 10자 시도
  if (Number.isNaN(dt.getTime())) return s.slice(0, 10);
  return toKstYMD(dt); // KST YMD
};

// YYYY-MM-DD 문자열 범위 비교
const inRangeYMD = (ymd: string, startYMD?: string, endYMD?: string) => {
  if (!ymd) return false;
  if (startYMD && ymd < startYMD) return false;
  if (endYMD && ymd > endYMD) return false;
  return true;
};

const GuessPage = () => {
  const { user, gameInfo, isReady } = useAuth();
  const isInGame = gameInfo.status === 'IN_GAME';
  const roomId = gameInfo.roomId;

  const toast = useToast();
  const [allParticipants, setAllParticipants] = useState<User[]>([]);
  const [usersToGuess, setUsersToGuess] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null); // ← room 정보
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // 모달 표시 여부 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!isReady || !user || !isInGame || !roomId) {
      setIsPageLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        const [participants, fetchedHistory, info] = await Promise.all([
          getRequest<User[]>(`/room/${roomId}/participants`),
          getRequest<GuessHistory[]>('/manito/guess/history'),
          getRequest<RoomInfo>(`/room/${roomId}`), // ← 방 정보 호출
        ]);

        setAllParticipants(participants);
        setRoomInfo(info);

        const filtered = participants.filter((u) => u.userId !== Number(user.id));
        const sorted = [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'ko'));

        setUsersToGuess(sorted);
        setGuessHistory(fetchedHistory);
      } catch {
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
  }, [isInGame, roomId, user, isReady, toast]);

  // 게임방 시작/종료일(KST YMD) 계산: roomInfo에서 가져옴
  const roomStartYMD = useMemo(
    () => normalizeGuessYMD_KST(roomInfo?.startDate),
    [roomInfo]
  );
  const roomEndYMD = useMemo(
    () => normalizeGuessYMD_KST(roomInfo?.endDate),
    [roomInfo]
  );

  // 현재 방 참가자 + (시작일 이후, 종료일 이내)만 남김
  const roomHistory = useMemo(
    () =>
      guessHistory.filter((g) => {
        const isThisRoomParticipant = allParticipants.some(
          (u) => u.userId === g.guessedUserId
        );
        if (!isThisRoomParticipant) return false;

        const ymd = normalizeGuessYMD_KST(g.guessedDate);
        return inRangeYMD(ymd, roomStartYMD || undefined, roomEndYMD || undefined);
      }),
    [guessHistory, allParticipants, roomStartYMD, roomEndYMD]
  );

  const todayString = toKstYMD(new Date());

  // 오늘 추측 여부 (필터된 히스토리 기준)
  const todaysGuess = roomHistory.find(
    (g) => normalizeGuessYMD_KST(g.guessedDate) === todayString
  );
  const hasGuessedToday = !!todaysGuess;

  const guessedUserToday = todaysGuess
    ? allParticipants.find((u) => u.userId === todaysGuess.guessedUserId)
    : null;

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
        isCorrect: response === true ? true : false,
      };
      if (response === true) {
        await postRequest<void>('/notice/guess'); // 마니띠가 마니또 맞췄을 시 추측 알림 전송
      }

      setGuessHistory((prevHistory) => [...prevHistory, newGuess]);
      setConfirmOpen(false);
      setSelectedId(null);
      toast({
        title: '추측이 완료되었습니다!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch {
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

  if (!isReady || isPageLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner />
      </Flex>
    );
  }

  if (!isInGame) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text textStyle="title_sm">참여중인 게임이 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <Box p={3} m={3}>
      <Text textStyle="title_mlg" mb={2}>✪ 추측하기</Text>
      <Text textStyle="caption_sm" color="gray.600" mb={4}>
        내 마니또는 누구일까? 두근두근 맞혀보기
      </Text>

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
          <Button
            variant="ghost"
            textStyle="body_sm"
            color="purple.500"
            onClick={handleShowHistory}
          >
            이전 추측 기록
          </Button>
        </Flex>

        {usersToGuess.map((participant) => (
          <Box
            key={participant.userId}
            border={
              !hasGuessedToday && selectedId === participant.userId
                ? '3px solid #A48AFB'
                : '1px solid #e2e2e2'
            }
            borderRadius="lg"
            onClick={() => handleSelect(participant.userId)}
            cursor={hasGuessedToday ? 'not-allowed' : 'pointer'}
            bg={
              !hasGuessedToday && selectedId === participant.userId
                ? 'purple.50'
                : 'white'
            }
            transition="all 0.2s"
            _hover={!hasGuessedToday ? { borderColor: 'purple.300', bg: 'purple.50' } : {}}
          >
            <ProfileListItem
              name={participant.name}
              statusMessage={participant.statusMessage}
            />
          </Box>
        ))}

        <LongButton
          onClick={handleConfirm}
          disabled={hasGuessedToday || usersToGuess.length === 0}
        >
          {hasGuessedToday ? '오늘은 이미 추측 완료' : '이 사람으로 추측하기'}
        </LongButton>
      </VStack>

      {/* --- 모달 섹션 --- */}
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
      <BaseModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="추측하시겠습니까?"
        body={
          <Text>
            {allParticipants.find((u) => u.userId === selectedId)?.name}
            님을 마니또로 추측합니다.
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
      <BaseModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="이전 추측 보기"
        body={
          roomHistory.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              추측 기록이 없습니다.
            </Text>
          ) : (
            <VStack align="stretch" gap={2}>
              {roomHistory.map((g) => {
                const guessedUser = allParticipants.find(
                  (u) => u.userId === g.guessedUserId
                );
                const ymd = normalizeGuessYMD_KST(g.guessedDate);
                const mmdd = ymd.slice(5).replace('-', '.'); // "MM.DD"
                return (
                  <BasicListItem
                    key={`${ymd}_${g.guessedUserId}`}
                    date={mmdd}
                    content={guessedUser?.name || '알 수 없음'}
                  />
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
