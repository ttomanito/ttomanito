// components/layout/AppHeader.tsx

import { Flex, Image, Icon } from "@chakra-ui/react"
import { FaBell, FaCog } from "react-icons/fa"

const AppHeader = () => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      pt={2}
      mb={2}
      py={4}   
      px={4}              // ← 양옆 16px 패딩
    >
      <Image src="/icons/logo.svg" h="40px" alt="logo" />

      <Flex gap={4}>
        <Icon as={FaBell} boxSize={6} color="black" />
        <Icon as={FaCog} boxSize={6} color="black" />
      </Flex>
    </Flex>
  )
}

export default AppHeader

