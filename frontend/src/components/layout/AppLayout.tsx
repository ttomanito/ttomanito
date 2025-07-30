import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  Flex
} from "@chakra-ui/react"
import { Outlet, useLocation, matchPath } from "react-router-dom"
import AppHeader from "./AppHeader"
import BottomNav from "./BottomNav"
import bgImage from "@/assets/imgs/profile_bg.png"

// 왼쪽 텍스트 영역
const PcMent = () => (
  <Flex
    h="100dvh"
    align="center"       // ← 수직 중앙
    justify="flex-start" // ← 수평은 왼쪽 정렬 유지
    pl={20}
    pr={8}
    color="black"
    textAlign="left"
  >
    <Box maxW="320px">
      <Text textStyle="title_lg" mb={4}>
        또 마니또
      </Text>
      <Text textStyle="body_md">
        마니또와 마니띠는 랜덤으로 매칭돼요<br />
        정해진 날짜에만 열리는 미션!<br />
        그 날만큼은 마니또에게 더 따뜻한<br />
        마음을 전해보세요 💌
      </Text>
    </Box>
  </Flex>
)

export default function AppLayout() {
  const { pathname } = useLocation()

  const noHeaderPatterns = ["/chat/:chatRoomId/call", "/", "/room", "/user/register", "/manito/:roomId/matching"]
  const noBottomPatterns = [...noHeaderPatterns]

  const hideHeader = noHeaderPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  )
  const hideBottom = noBottomPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  )

//   const isDesktop = useBreakpointValue({ base: false, lg: true })

  return (
    <Box
      bgImage={`url(${bgImage})`}
      bgRepeat="repeat"
      bgSize="auto"
      minH="100dvh"
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        w="100%"
        h="100dvh"
      >
        {/* 왼쪽 텍스트 영역 */}
        <GridItem display={{ base: "none", lg: "flex" }}>
          <PcMent />
        </GridItem>

        {/* 오른쪽 앱 화면 영역 */}
        <GridItem display="flex" justifyContent="flex-start">
          <Box
            w="560px"
            h="100dvh"
            bg="rgba(255,255,255,0.6)"
            backdropFilter="blur(4px)"
          >
            <Container
              maxW="560px"
              w="full"
              px={4}
              display="grid"
              gridTemplateRows="auto 1fr auto"
              h="100dvh"
              overflow="hidden"
            >
              {!hideHeader && <AppHeader />}
              <Box as="main" overflowY="auto">
                <Outlet />
              </Box>
              {!hideBottom && <BottomNav />}
            </Container>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  )
}