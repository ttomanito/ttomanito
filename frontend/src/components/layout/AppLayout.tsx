import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  Flex,
  chakra,
  AspectRatio,
} from "@chakra-ui/react"
import { Outlet, useLocation, matchPath } from "react-router-dom"
import AppHeader from "./AppHeader"
import BottomNav from "./BottomNav"
import bgImage from "@/assets/imgs/profile_bg.png"

// 왼쪽 텍스트 영역
const PcMent = () => (
  <Flex
    h="100dvh"
    align="center"
    justify="flex-start"
    pl={20}
    pr={8}
    color="black"
    textAlign="left"
  >
    <Box maxW="320px">
      <AspectRatio ratio={15/ 15} maxW="560px">
        <chakra.video
          src="/assets/demo-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </AspectRatio>

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

  const noHeaderPatterns = [
    "/chat/:chatRoomId/call",
    "/",
    "/room",
    "/user/register",
    "/manito/:roomId/matching",
  ]
  const noBottomPatterns = [...noHeaderPatterns]

  const hideHeader = noHeaderPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  )
  const hideBottom = noBottomPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  )

  return (
    <Box
      bgImage={`url(${bgImage})`}
      bgRepeat="repeat"
      bgSize="auto"
      minH="100dvh"
    >
      {/* md 이상: 좌우 2단 레이아웃 */}
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        w="100%"
        h="100dvh"
      >
        {/* 왼쪽 설명 영역: md 이상만 표시 */}
        <GridItem display={{ base: "none", md: "flex" }}>
          <PcMent />
        </GridItem>

        {/* 오른쪽 앱 화면 */}
        <GridItem
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {/* xs~mobile: 전체 너비 */}
          <Box
            display={{ base: "block", mobile: "none", md: "none" }}
            w="100%"
            h="100dvh"
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

          {/* mobile~md: 중앙 고정폭 520px */}
          <Box
            display={{ base: "none", mobile: "block", md: "none" }}
            w="520px"
            h="100dvh"
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

          {/* md 이상: 왼쪽 정렬된 앱 화면 (왼쪽 경계가 중앙) */}
          <Box
            position="absolute"
            left="0"
            w="520px"
            h="100dvh"
            bg="white"
            backdropFilter="blur(4px)"
            display={{ base: "none", md: "block" }}
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
