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
const LongButton = forwardRef<HTMLButtonElement, LongButtonProps>(({ children, ...rest }, ref) => {
  // children: <LongButton>안에 적은 내용(텍스트/아이콘 등)
  // ...rest: onClick, isLoading, mt, w 등 ButtonProps의 나머지 속성들
  //          (필요한 속성은 자유롭게 덮어씌워 사용할 수 있게 해둡니다)

  return (
    <Button
      ref={ref} // 부모가 준 ref를 실제 Button DOM에 연결
      w="full" // 가로 100% (긴 버튼)
      size="lg" // 큰 사이즈
      borderRadius="full" // 둥근 pill 형태
      bg="white" // 배경은 검정
      color="black" // 글자는 흰색
      _hover={{ bg: 'gray.800' }} // hover 시 조금 더 밝은 검정
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }} // 비활성화 시 스타일
      {...rest} // 나머지 props(onClick, isLoading 등)를 그대로 전달
    >
      {children}
    </Button>
  );
});

// displayName을 지정해두면 React DevTools에서 컴포넌트 이름이 예쁘게 보입니다.
LongButton.displayName = 'LongButton';

export default LongButton;
