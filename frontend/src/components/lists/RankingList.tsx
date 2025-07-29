import { VStack } from '@chakra-ui/react';
import RankingListItem from './RankingListItem'; // 개별 항목 컴포넌트

interface Ranking {
  rank: number;
  name: string;
  statusMessage: string;
  score: number;
}

interface RankingListProps {
  data: Ranking[];
}

// 이름 충돌을 피하기 위해 RankingList로 변경
const RankingList: React.FC<RankingListProps> = ({ data }) => {
  return (
    <VStack>
      {data.map(item => (
        <RankingListItem key={item.rank} {...item} />
      ))}
    </VStack>
  );
};

export default RankingList;
