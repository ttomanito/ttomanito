// components/layout/AppHeader.tsx

import { Flex, Image } from "@chakra-ui/react"

const AppHeader = () => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      pt={2}
      mb={2}
      py={4}
      px={4} // ← 양옆 16px 패딩
    >
      {/* 로고 */}
      <Image src="/src/assets/logo.svg" boxSize={10} alt="logo" />

      {/* 오른쪽 아이콘 */}
      <Flex gap={4}>
        <Image src="/src/assets/bellicon.svg" boxSize={12} alt="알림" />
        <Image src="/src/assets/menuicon.svg" boxSize={14} alt="메뉴" />
      </Flex>
    </Flex>
  )
}

export default AppHeader
