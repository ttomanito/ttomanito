// components/ui/CustomButton.tsx

// forwardRef: 부모가 이 버튼의 실제 DOM(ref)을 잡아야 할 때(포커스 주기 등) 대비해 사용
import { forwardRef } from "react"

// Chakra UI의 기본 Button 컴포넌트를 래핑해서 스타일을 고정합니다.
import { Button } from "@chakra-ui/react"

// TS 5에서는 타입만 불러올 때 `import type` 사용을 권장합니다.
import type { ButtonProps } from "@chakra-ui/react"

// 이 컴포넌트는 "스타일 통일"이 목적이므로
// variant, colorScheme는 외부에서 못 넣게 막습니다(내부에서 이미 고정했기 때문).
export type CustomButtonProps = Omit<ButtonProps, "variant" | "colorScheme">

// forwardRef<HTMLButtonElement, CustomButtonProps>
//  - 부모가 넘긴 ref를 실제 <button> DOM까지 전달할 수 있게 함 (ref forwarding)
const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, w = "50%", ...rest }, ref) => {
    // children: <CustomButton> 안쪽에 넣는 내용(텍스트/아이콘)
//  w: 기본 50%로, 필요하면 사용처에서 덮어씌울 수 있음
//  ...rest: onClick, isLoading, mt 등 Chakra Button이 가진 나머지 props

    return (
      <Button
        ref={ref}                 // 부모가 준 ref를 Button DOM에 연결
        w={w}                      // 기본 가로폭 50% (필요 시 사용처에서 덮어쓰기 가능)
        size="lg"                  // 큰 버튼 사이즈
        borderRadius="full"        // pill 형태
        bg="black"                 // 검정 배경
        color="white"              // 흰색 텍스트
        _hover={{ bg: "gray.800" }}                   // hover 시 약간 밝은 검정
        _disabled={{ opacity: 0.6, cursor: "not-allowed" }} // 비활성화 스타일
        {...rest}                  // 나머지 props 그대로 전달 (onClick 등)
      >
        {children}
      </Button>
    )
  }
)

// DevTools에서 보기 좋게 이름 지정
CustomButton.displayName = "CustomButton"

export default CustomButton
