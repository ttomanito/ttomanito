import { Box, Grid, GridItem } from '@chakra-ui/react';
import RankingListItem from './RankingListItem';

interface Ranking {
  rank: number;
  name: string;
  statusMessage: string;
  score: number;
}

interface RankingListProps {
  data: Ranking[];
}

const RankingList: React.FC<RankingListProps> = ({ data }) => {
  return (
    <Box w="full">
      {/* 테이블 헤더 */}
      <Grid
        templateColumns="40px 1fr 1fr 40px"
        px={4}
        py={2}
        bg="gray.100"
        fontSize="sm"
        fontWeight="bold"
        color="gray.600"
        borderTopRadius="md"
      >
        <GridItem>등수</GridItem>
        <GridItem>마니띠</GridItem>
        <GridItem>마니또</GridItem>
        <GridItem textAlign="right">횟수</GridItem>
      </Grid>

      {/* 항목 리스트 */}
      {data.map(item => (
        <RankingListItem key={item.rank} {...item} />
      ))}
    </Box>
  );
};

export default RankingList;
