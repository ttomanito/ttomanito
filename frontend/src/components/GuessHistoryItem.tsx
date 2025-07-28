// components/GuessHistoryItem.tsx
import { Flex, Text } from '@chakra-ui/react';

interface GuessHistoryItemProps {
  date: string;
  name: string;
}

const GuessHistoryItem: React.FC<GuessHistoryItemProps> = ({ date, name }) => {
  return (
    <Flex justify="space-between" align="center" bg="gray.50" p={2} borderRadius="md" w="full">
      <Text fontSize="sm" color="gray.800">
        {date}
      </Text>
      <Text fontSize="sm" fontWeight="medium" color="gray.800">
        {name}
      </Text>
    </Flex>
  );
};

export default GuessHistoryItem;
