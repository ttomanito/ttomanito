import { Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';

interface Props {
  date: string;
  label: string;
  defaultChecked?: boolean;
}

const MissionListItem: React.FC<Props> = ({ date, label, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <Flex
      justify="space-between"
      align="center"
      bg="gray.50"
      p={2}
      borderRadius="md"
      onClick={() => setChecked(!checked)}
      cursor="pointer"
      _hover={{ bg: 'gray.100' }}
    >
      <Text fontSize="sm">{date}</Text>
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>
    </Flex>
  );
};

export default MissionListItem;
