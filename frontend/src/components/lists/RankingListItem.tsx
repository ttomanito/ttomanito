import { Flex, Box, Text, Circle } from '@chakra-ui/react';

interface RankingItemProps {
  rank: number;
  name: string;
  statusMessage: string;
  score: number;
}

const getRankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'purple.500', color: 'white' };
  if (rank === 2) return { bg: 'purple.400', color: 'white' };
  if (rank === 3) return { bg: 'purple.300', color: 'white' };
  return { bg: 'white', color: 'purple.500', border: '1px solid #805AD5' };
};

const RankingListItem: React.FC<RankingItemProps> = ({ rank, name, statusMessage, score }) => {
  const rankStyle = getRankStyle(rank);

  return (
    <Flex align="center" justify="space-between" bg="white" p={3} borderRadius="md" shadow="sm">
      {/* 순위 뱃지 */}
      <Flex align="center" gap={3}>
        <Circle size="8" {...rankStyle} fontWeight="bold">
          {rank}
        </Circle>
        <Box>
          <Text fontWeight="semibold">{name}</Text>
          <Text fontSize="xs" color="gray.500">
            {statusMessage}
          </Text>
        </Box>
      </Flex>

      {/* 가운데 화살표 + ??? */}
      <Text fontWeight="medium" color="gray.700">
        ← ???
      </Text>

      {/* 점수 */}
      <Text fontWeight="bold">{score}</Text>
    </Flex>
  );
};

export default RankingListItem;
