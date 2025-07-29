import { Flex, Text } from '@chakra-ui/react';

interface GuessListItemProps {
  date: string;
  name: string;
}

const GuessListItem: React.FC<GuessListItemProps> = ({ date, name }) => {
  return (
    <Flex justify="space-between" align="center" bg="gray.50" p={2} borderRadius="xl" w="full">
      <Text textStyle="body_sm">
        {date}
      </Text>
      <Text textStyle="body_sm">
        {name}
      </Text>
    </Flex>
  );
};

export default GuessListItem;
