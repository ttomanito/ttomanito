// src/components/modal/MessageInputBody.tsx

import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import TextInput from '@/components/inputs/TextInput';
import DoubleButton from '@/components/buttons/DoubleButton';

// 이 컴포넌트가 부모로부터 받을 props 타입을 정의합니다.
interface MessageInputBodyProps {
  // 사용자가 입력할 메시지의 초기값
  initialMessage?: string;
  // '확인' 버튼을 눌렀을 때 실행될 함수 (입력된 메시지를 인자로 받음)
  onSubmit: (message: string) => void;
  // '취소' 버튼을 눌렀을 때 실행될 함수
  onClose: () => void;
}

const MessageInputBody: React.FC<MessageInputBodyProps> = ({
  initialMessage = '참여합니다.', // 기본값 설정
  onSubmit,
  onClose,
}) => {
  // 이 컴포넌트가 자신의 입력 상태를 직접 관리합니다.
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = () => {
    // 입력값이 비어있지 않으면 onSubmit 함수를 호출
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