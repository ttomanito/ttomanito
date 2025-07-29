// LongButton.tsx

// forwardRef: 부모가 이 버튼의 실제 DOM(ref)을 잡아야 할 때를 대비해 사용합니다.
// 예) 포커스 주기, 스크롤 위치 맞추기 등
import { forwardRef } from 'react';

// Chakra UI의 기본 Button 컴포넌트를 가져옵니다. 이 위에 스타일만 고정해서 감쌀 거예요.
import { Button } from '@chakra-ui/react';

// TS 5에서는 타입만 가져올 땐 `import type`을 쓰는 걸 권장합니다.
// ButtonProps: Chakra UI Button이 받을 수 있는 모든 props 타입
import type { ButtonProps } from '@chakra-ui/react';

// 이 컴포넌트는 "스타일을 통일"하기 위한 용도이므로
// 외부에서 variant(버튼 테마)나 colorScheme(색상 스킴)를 주지 못하게 막습니다.
// -> 우리가 안에서 이미 고정했기 때문!
export type LongButtonProps = Omit<ButtonProps, 'variant' | 'colorScheme'>;

// forwardRef<HTMLButtonElement, LongButtonProps>
//  - 이 컴포넌트가 받는 ref의 실제 타입은 HTMLButtonElement 입니다.
//  - 부모가 ref를 넘겨주면 Button에 그대로 연결(ref forwarding)해 줍니다.

const LongButton = forwardRef<HTMLButtonElement, LongButtonProps>(({ children = '확인', ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      w="full"
      size="lg"
      borderRadius="full"
      bg="accent.500"
      color="black"
      textStyle="body_sm"
      border="1px solid black"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
      _hover={{ bg: 'accent.600' }}
      _active={{ bg: 'accent.700' }}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      {...rest}
    >
      {children}
    </Button>
  );
});

LongButton.displayName = 'LongButton';

export default LongButton;
