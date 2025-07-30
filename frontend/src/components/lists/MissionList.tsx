// components/MissionList.tsx
import { VStack, Text } from '@chakra-ui/react';
import MissionListItem from './MissionListItem';

export interface Mission {
  id: number;
  date: string;
  content: string;
  completed: boolean;
}

interface MissionListProps {
  missions: Mission[];
}

const MissionList: React.FC<MissionListProps> = ({ missions }) => {
  if (missions.length === 0) {
    return <Text color="gray.500">이전 미션이 없습니다.</Text>;
  }

  return (
    <VStack align="stretch">
      {missions.map(mission => (
        <MissionListItem
          key={mission.id}
          date={mission.date}
          content={mission.content}
          completed={mission.completed}
        />
      ))}
    </VStack>
  );
};

export default MissionList;
