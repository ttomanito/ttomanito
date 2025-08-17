// src/components/chat/ChatAnalysisButton.tsx
import { IconButton, Badge, HStack, Tooltip } from '@chakra-ui/react';
import { RiRobot2Line } from 'react-icons/ri';

type Props = { onOpen: () => void; alreadyUsed: boolean };

export default function ChatAnalysisButton({ onOpen, alreadyUsed }: Props) {
  const tooltipText = alreadyUsed
    ? '내 1회 분석 이미 사용됨 (결과는 계속 열람 가능)'
    : 'AI가 상대방 대화 성향을 분석합니다 (내 1회)';

  return (
    <HStack>
      <Tooltip.Root openDelay={300} closeDelay={100}>
        <Tooltip.Trigger asChild>
          <IconButton
            aria-label="AI 분석"
            size="sm"
            variant="ghost"
            onClick={onOpen}
          >
            <RiRobot2Line />
          </IconButton>
        </Tooltip.Trigger>

        <Tooltip.Positioner>
          <Tooltip.Content>
            {tooltipText}
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>

      {alreadyUsed && <Badge colorScheme="purple">1/1</Badge>}
    </HStack>
  );
}
