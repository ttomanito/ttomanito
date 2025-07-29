import { VStack, Text } from '@chakra-ui/react';
import GuessListItem from './GuessListItem';

interface Guess {
  id: number;
  date: string;
  name: string;
}

interface GuessHistoryListProps {
  guesses: Guess[];
}

const GuessHistoryList: React.FC<GuessHistoryListProps> = ({ guesses }) => {
  if (guesses.length === 0) {
    return <Text color="gray.500">이전 추측이 없습니다.</Text>;
  }

  return (
    <VStack align="stretch">
      {guesses.map(guess => (
        <GuessListItem key={guess.id} date={guess.date} name={guess.name} />
      ))}
    </VStack>
  );
};

export default GuessHistoryList;
