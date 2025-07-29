// components/MissionListItem.tsx
import { Flex, Text, Box } from '@chakra-ui/react';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { RiCheckboxBlankCircleLine } from 'react-icons/ri';

interface MissionListItemProps {
  date: string;
  content: string;
  completed: boolean;
}

const MissionListItem: React.FC<MissionListItemProps> = ({ date, content, completed }) => {
  const IconComponent = completed ? RiCheckboxCircleLine : RiCheckboxBlankCircleLine;

  return (
    <Flex bg="#F7F7F7" borderRadius="md" p={3} align="center" justify="space-between" h="52px">
      <Flex direction="row" align="center" gap={4}>
        <Text fontSize="sm" color="gray.700" minW="50px">
          {date}
        </Text>
        <Text fontSize="sm" fontWeight="medium" color="gray.800">
          {content}
        </Text>
      </Flex>

      <Box>
        <IconComponent size={18} color={completed ? '#9B59FF' : '#E0E0E0'} />
      </Box>
    </Flex>
  );
};

export default MissionListItem;
