import { Grid, GridItem, Text, Box } from '@chakra-ui/react';

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
    <Grid
      templateColumns="40px 1fr 1fr 40px"
      px={4}
      py={3}
      alignItems="center"
      borderBottom="1px solid #E2E8F0"
      bg="white"
      borderRadius="xl"
    >
      {/* 순위 원형 */}
      <GridItem>
        <Box
          w="24px"
          h="24px"
          fontSize="xs"
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

      {/* 마니띠 */}
      <GridItem>
        <Text fontWeight="semibold" fontSize="sm">
          {name}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {statusMessage}
        </Text>
      </GridItem>

      {/* 마니또 표시 */}
      <GridItem>
        <Text fontWeight="medium" fontSize="sm" color="gray.700">
          ← ???
        </Text>
      </GridItem>

      {/* 점수 */}
      <GridItem textAlign="right">
        <Text fontWeight="bold">{score}</Text>
      </GridItem>
    </Grid>
  );
};

export default RankingListItem;
