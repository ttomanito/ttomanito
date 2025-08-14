//frontend\src\pages\Rank\RankingPage.tsx
import { useState, useEffect } from 'react';
import {
  Box, Button, VStack, Text, HStack, Grid, GridItem, Spinner, Flex,
} from '@chakra-ui/react';
import { getRequest } from '@/api/requests';
import { useAuth } from '@/stores/authStore';

// ===== 타입 정의 =====
interface Participant {
  userId: number;
  roomUserId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
  profileImageUrl?: string;
}

interface RankingApiResponse {
  userId: number;
  metricValue: number | string;
  rankPosition: number;
}

interface RankingItemData {
  rank: number;
  name: string;
  statusMessage: string;
  score: number | string;
}

// ===== 랭킹 아이템 컴포넌트 =====
interface RankingItemProps extends RankingItemData {
  hideScore?: boolean;
}

const getRankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'purple.500', color: 'white' };
  if (rank === 2) return { bg: 'purple.400', color: 'white' };
  if (rank === 3) return { bg: 'purple.300', color: 'white' };
  return { bg: 'gray.100', color: 'purple.500', border: '1px solid #E2E8F0' };
};

const RankingListItem: React.FC<RankingItemProps> = ({
  rank, name, statusMessage, score, hideScore = false,
}) => {
  const rankStyle = getRankStyle(rank);
  return (
    <Grid
      templateColumns="50px 1fr 1fr 80px"
      p={4}
      alignItems="center"
      w="100%"
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
    >
      <GridItem>
        <Box
          w="28px"
          h="28px"
          fontSize="sm"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          {...rankStyle}
        >
          {rank}
        </Box>
      </GridItem>
      <GridItem>
        <Text textStyle="body_sm">{name}</Text>
        <Text textStyle="caption_xs_light">{statusMessage}</Text>
      </GridItem>
      {/* 마니띠 자리 예시 */}
      <GridItem>
        <Text textStyle="body_mg" color="gray.400">
          → ???
        </Text>
      </GridItem>
      <GridItem textAlign="center">
        {!hideScore && (
          <Text textStyle="title_sm" color="purple.500">
            {score}
          </Text>
        )}
      </GridItem>
    </Grid>
  );
};

// ===== 메인 RankingPageWithTabs =====
const tabs = [
  { id: 1, label: '통화', unit: '', genreCode: 1 },
  { id: 2, label: '채팅', unit: '', genreCode: 2 },
  { id: 3, label: '미션 수행 횟수', unit: '회', genreCode: 3 },
];

const RankingPage: React.FC = () => {
  // 🔥 변경: auth store 새 구조 사용
  const { gameInfo, isReady } = useAuth();
  const isInGame = gameInfo.status === 'IN_GAME';
  const roomId = gameInfo.roomId;
  
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [rankingData, setRankingData] = useState<RankingItemData[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const activeTab = tabs[activeTabIdx];
  const hideScore = activeTab.genreCode !== 3;

  // 1. 참여자 목록(roomId 필요)
  useEffect(() => {
    if (!isReady || !isInGame || !roomId) {
      setParticipants([]);
      return;
    }
    const fetchParticipants = async () => {
      try {
        const data = await getRequest<Participant[]>(`/room/${roomId}/participants`);
        setParticipants(data);
      } catch (err) {
        console.error('게임 참여자 불러오기 실패', err);
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, [isReady, isInGame, roomId]);

  // 2. 랭킹 데이터(tabs 변경/참여자 정보 가져온 직후 roomId 필요)
  useEffect(() => {
    if (!isReady || !isInGame || !roomId || participants.length === 0) {
      setRankingData([]);
      return;
    }
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const rankList = await getRequest<RankingApiResponse[]>(`/rank/${activeTab.genreCode}`);
        // userId → 참가자 정보 매칭
        const merged = rankList.map((rankItem) => {
          const participant = participants.find((p) => p.userId === rankItem.userId);
          return {
            rank: rankItem.rankPosition,
            score: rankItem.metricValue,
            name: participant?.name || `user#${rankItem.userId}`,
            statusMessage: participant?.statusMessage || '',
          };
        });
        setRankingData(merged);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
    // 탭, 참가자 목록, 게임/방 상태가 바뀔 때마다
  }, [activeTab, participants, isReady, isInGame, roomId]);

  // ===== 렌더링 =====
  if (!isReady || loading) {
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
    <Box bg="white" minH="100vh" p={2} m={2}>
      <VStack gap={4} align="stretch" maxW="500px" mx="auto">
        <VStack align="flex-start" gap={2}>
          <Text textStyle="title_mlg">✪ 중간 랭킹</Text>
          <Text textStyle="caption_sm" color="gray.500">
            나는 몇 등일까? 내 마니또 순위를 확인해보세요
          </Text>
          <Text textStyle="caption_sm" color="gray.500">
            순위는 매일 자정에 업데이트됩니다
          </Text>
        </VStack>
        <HStack w="100%" gap={3} justify="center" mb={1}>
          {tabs.map((tab, idx) => {
            const isActive = activeTabIdx === idx;
            return (
              <Button
                key={tab.id}
                textStyle="caption_sm"
                flex={1}
                onClick={() => setActiveTabIdx(idx)}
                borderRadius="full"
                variant="outline"
                bg={isActive ? 'purple.400' : 'white'}
                color={isActive ? 'white' : 'gray.600'}
                borderColor={isActive ? 'purple.400' : 'gray.200'}
                _hover={{
                  bg: isActive ? 'purple.500' : 'gray.50',
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </HStack>
        <Grid
          templateColumns="50px 1fr 1fr 80px"
          px={2} py={3} w="100%" textStyle="body_sm"
          borderTop="1px solid"
          borderBottom="1px solid"
          borderColor="black"
        >
          <GridItem>등수</GridItem>
          <GridItem>마니또</GridItem>
          <GridItem>마니띠</GridItem>
          <GridItem textAlign="center">{!hideScore ? activeTab.unit : ''}</GridItem>
        </Grid>
        <VStack w="100%" gap={3}>
          {rankingData.length === 0 ? (
            <Text textAlign="center" color="gray.400">
              데이터가 없습니다
            </Text>
          ) : (
            rankingData.map((user) => (
              <RankingListItem
                key={`${activeTab.genreCode}-${user.rank}`}
                rank={user.rank}
                name={user.name}
                statusMessage={user.statusMessage}
                score={user.score}
                hideScore={hideScore}
              />
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default RankingPage;