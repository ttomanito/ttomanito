/**
 * ✅ DoubleButton 사용법:
 * <DoubleButton
 *   leftLabel="취소"
 *   rightLabel="확인"
 *   onLeftClick={() => console.log('취소')}
 *   onRightClick={() => console.log('확인')}
 * />
 */

import { forwardRef } from 'react';
import { HStack, Button } from '@chakra-ui/react';
import type { StackProps, ButtonProps } from '@chakra-ui/react';

export type DoubleButtonProps = {
  leftLabel: string;
  rightLabel: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  leftProps?: ButtonProps;
  rightProps?: ButtonProps;
} & Omit<StackProps, 'children'>; // 🔥 핵심: ButtonProps ❌, StackProps ✅

const DoubleButton = forwardRef<HTMLDivElement, DoubleButtonProps>(
  ({ leftLabel, rightLabel, onLeftClick, onRightClick, leftProps, rightProps, ...rest }, ref) => {
    return (
      <HStack ref={ref} gap="4" w="full" {...rest}>
        <Button
          flex="1"
          bg="white"
          color="accent.500"
          border="1px solid"
          borderColor="accent.500"
          borderRadius="full"
          textStyle="body_sm"
          boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)" // ✅ 그림자 추가
          rounded="xl"
          _hover={{ bg: 'accent.50' }}
          onClick={onLeftClick}
          {...leftProps}
        >
          {leftLabel}
        </Button>
        <Button
          flex="1"
          bg="accent.500"
          color="black"
          border="1px solid"
          borderColor="accent.500"
          borderRadius="full"
          textStyle="body_sm"
          boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)" // ✅ 그림자 추가
          rounded="xl"
          _hover={{ bg: 'accent.600' }}
          onClick={onRightClick}
          {...rightProps}
        >
          {rightLabel}
        </Button>
      </HStack>
    );
  }
);

DoubleButton.displayName = 'DoubleButton';

export default DoubleButton;
