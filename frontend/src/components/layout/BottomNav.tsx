import {
  Flex,
  HStack,
  Image,
  Box,
  type FlexProps,
} from "@chakra-ui/react"
import { Link, useLocation } from "react-router-dom"

import homeIcon from "@/assets/homicon.svg"
import chatIcon from "@/assets/chaticon.svg"
import guessIcon from "@/assets/guessicon.svg"
import rankingIcon from "@/assets/rankingicon.svg"

type NavItem = {
  to: string
  label: string
  icon: string
}

type BottomNavProps = FlexProps & {
  items?: NavItem[]
  height?: number | string
}

const DEFAULT_ITEMS: NavItem[] = [
  { to: "/home",    label: "홈",   icon: homeIcon },
  { to: "/chat",    label: "채팅", icon: chatIcon },
  { to: "/guess",   label: "추측", icon: guessIcon },
  { to: "/ranking", label: "랭킹", icon: rankingIcon },
]

const BottomNav: React.FC<BottomNavProps> = ({
  items = DEFAULT_ITEMS,
  height = "74px",
  ...props
}) => {
  const location = useLocation()

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <Flex
      as="nav"
      role="navigation"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      h={height}
      align="center"
      justify="space-around"
      paddingTop="10px"    // ✅ 추가
      paddingBottom="10px" // ✅ 추가
      {...props}
    >
      <HStack w="100%" justify="space-around">
        {items.map(({ to, icon }) => {
          const active = isActive(to)

          return (
            <Link key={to} to={to} style={{
                width: "100%", 
                display: "flex", 
                justifyContent: "center",

              }}>
              <Box
                w="55px"
                h="55px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="xl"
                bg={active ? "gray.100" : "transparent"}
                boxShadow={active ? "sm" : "none"}
                transition="all 0.2s ease"
              >
                <Image
                  src={icon}
                  alt={to}
                  boxSize={14}
                />
              </Box>
            </Link>
          )
        })}
      </HStack>
    </Flex>
  )
}

export default BottomNav
