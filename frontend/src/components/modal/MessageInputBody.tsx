import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import TextInput from '@/components/inputs/TextInput';
import DoubleButton from '@/components/buttons/DoubleButton';


interface MessageInputBodyProps {
  initialMessage?: string;
  onSubmit: (message: string) => void;
  onClose: () => void;
}

const MessageInputBody: React.FC<MessageInputBodyProps> = ({
  initialMessage = '참여합니다.', 
  onSubmit,
  onClose,
}) => {

  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
    }
  };

  return (
    <VStack gap={4} align="stretch">
      <TextInput
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="상태 메시지"
        onKeyUp={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />
      <DoubleButton
        leftLabel="취소"
        rightLabel="확인"
        onLeftClick={onClose}
        onRightClick={handleSubmit}
        mt={2}
      />
    </VStack>
  );
};

export default MessageInputBody;