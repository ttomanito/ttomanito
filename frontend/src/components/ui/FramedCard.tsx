// components/ui/FramedCard.tsx
import { Card, Text } from "@chakra-ui/react"
import type { ReactNode, ComponentProps } from "react"

type CardRootProps = ComponentProps<typeof Card.Root>

export type FramedCardProps = Omit<CardRootProps, "children"> & {
  /** 헤더/보더에 쓸 포인트 컬러 */
  accent?: string
  /** 헤더 영역에 렌더할 내용 (텍스트, 아이콘 등) */
  header?: ReactNode
  /** 본문 */
  children?: ReactNode
  /** 푸터(버튼 등) */
  footer?: ReactNode
  /** 헤더 텍스트 정렬 */
  headerAlign?: "left" | "center" | "right"
}

const FramedCard: React.FC<FramedCardProps> = ({
  accent = "pink.400",
  header,
  children,
  footer,
  headerAlign = "center",
  ...rest
}) => {
  return (
    <Card.Root
      bg="white"
      rounded="md"
      overflow="hidden"
      border="2px solid"
      borderColor={accent}
      boxShadow="sm"
      textAlign="center"
      {...rest}
    >
      {header && (
        <Card.Header bg={accent} color="black" py={2} px={4} textAlign={headerAlign}>
          {/* header가 단순 문자열이면 굵게 크게 보기 좋게 */}
          {typeof header === "string" ? (
            <Text fontSize="xl" fontWeight="bold">
              {header}
            </Text>
          ) : (
            header
          )}
        </Card.Header>
      )}

      <Card.Body p={6}>{children}</Card.Body>

      {footer && <Card.Footer p={4}>{footer}</Card.Footer>}
    </Card.Root>
  )
}

export default FramedCard
