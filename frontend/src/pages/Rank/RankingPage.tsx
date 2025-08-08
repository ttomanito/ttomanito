import React, { useState } from 'react';
import { Grid, GridItem, Text, Box, VStack, HStack, Button } from '@chakra-ui/react';

interface RankingItemProps {
  rank: number;
  name: string;
  statusMessage: string;
  score: number | string;
}

const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: 'purple.500', color: 'white' };
    if (rank === 2) return { bg: 'purple.400', color: 'white' };
    if (rank === 3) return { bg: 'purple.300', color: 'white' };
    return { bg: 'gray.100', color: 'purple.500', border: '1px solid #E2E8F0' };
};

const RankingListItem: React.FC<RankingItemProps> = ({ rank, name, statusMessage, score }) => {
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
        <Box w="28px" h="28px" fontSize="sm" borderRadius="full" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" {...rankStyle}>
          {rank}
        </Box>
      </GridItem>
      <GridItem>
        <Text textStyle="body_sm">{name}</Text>
        <Text textStyle="caption_xs_light">{statusMessage}</Text>
      </GridItem>
      <GridItem>
        <Text textStyle="body_mg" color="gray.400"> ←???</Text>
      </GridItem>
      <GridItem textAlign="center">
        <Text textStyle="title_sm" color="purple.500">{score}</Text>
      </GridItem>
    </Grid>
  );
};


const RankingPageWithTabs = () => {
  // 데이터 및 state는 이전과 동일합니다.
  const allRankingData = {
    missions: [
      { rank: 1, name: '박도윤', statusMessage: '미션 마스터', score: 25 },
      { rank: 2, name: '김민준', statusMessage: '열정적인 참여자', score: 21 },
    ],
    calls: [
      { rank: 1, name: '이서아', statusMessage: '최고의 수다쟁이', score: '5h 30m' },
      { rank: 2, name: '최은우', statusMessage: '수다쟁이', score: '4h 15m' },
    ],
    chats: [
      { rank: 1, name: '정하린', statusMessage: '타자왕', score: 1258 },
    ],
  };

  const tabs = [
    { id: 'missions', label: '미션 수행 횟수', unit: '회' },
    { id: 'calls', label: '통화 시간', unit: '시간' },
    { id: 'chats', label: '채팅 횟수', unit: '개' },
  ];

  const [activeTab, setActiveTab] = useState<'missions' | 'calls' | 'chats'>('calls');
  const currentRankingData = allRankingData[activeTab];
  const currentUnit = tabs.find(tab => tab.id === activeTab)?.unit;

  return (
    <Box bg="white" minH="100vh" px={6} py={4}>
      <VStack gap={4} align="stretch" maxW="500px" mx="auto">
        <VStack align="flex-start" gap={2}>
            <Text textStyle="title_mlg">
                ✪ 중간 랭킹
            </Text>
            <Text textStyle="caption_sm" color="gray.500">나는 몇 등일까? 내 마니또 랭킹을 확인해보세요</Text>
            <Text textStyle="caption_sm" color="gray.500">순위는 매일 자정에 업데이트됩니다</Text>
        </VStack>

        <HStack w="100%" gap={3} justify="center" mb={1}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                textStyle="caption_sm"
                flex={1}
                onClick={() => setActiveTab(tab.id as 'missions' | 'calls' | 'chats')}
                borderRadius="full"
                variant="outline"
                bg={isActive ? 'purple.400' : 'white'}
                color={isActive ? 'white' : 'gray.600'}
                borderColor={isActive ? 'purple.400' : 'gray.200'}
                _hover={{
                  bg: isActive ? 'purple.500' : 'gray.50'
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </HStack>

        <Grid templateColumns="50px 1fr 1fr 80px" px={2} py={3} w="100%" textStyle="body_sm" borderTop="1px solid" 
  borderBottom="1px solid" 
  borderColor="black">
          <GridItem>등수</GridItem>
          <GridItem>마니띠</GridItem>
          <GridItem>마니또</GridItem>
          <GridItem textAlign="center">{currentUnit}</GridItem>
        </Grid>
        <VStack w="100%" gap={3}>
          {currentRankingData.map((user) => (
            <RankingListItem
              key={`${activeTab}-${user.rank}`}
              rank={user.rank}
              name={user.name}
              statusMessage={user.statusMessage}
              score={user.score}
            />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default RankingPageWithTabs;