import { Box, Container, Grid, GridItem, Text, Flex, Image } from '@chakra-ui/react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import bgImage from '@/assets/imgs/profile_bg.png';
// import bgImage from '@/assets/imgs/background_purple_2.png';
import detective_ttoma_img from '@/assets/detective_ttoma.svg';
import logo_ttomanito from '@/assets/logo_ttomanito.svg';

// 왼쪽 텍스트 영역
const PcMent = () => (
  <Flex
    h="100dvh"
    align="center"
    justify="flex-start"
    pl="120px"
    pr={8}
    color="black"
    textAlign="left"
  >
    <Box maxW="320px">
      <Image
        src={detective_ttoma_img}
        alt="ttomanito character"
        maxW="100%"
        h="auto"
        objectFit="contain"
      />
      <Box pl={10}>
        <Image src={logo_ttomanito} alt="ttomanito logo" mb={2} />
        <Text textStyle="body_md" color="gray.500">
          <Text textStyle="title_md">두근두근!</Text>
          정해진 날짜에만 열리는 미션!
          <br />
          그 날만큼은 마니띠에게 더 따뜻한
          <br />
          마음을 전해보세요 💌
        </Text>
      </Box>
    </Box>
  </Flex>
);

export default function AppLayout() {
  const { pathname } = useLocation();

  const noHeaderPatterns = [
    '/chat/:chatRoomId/call',
    '/',
    '/main',
    '/room',
    '/room/wait',
    '/report/reportlist',
    '/manito/:roomId/matching',
  ];
  const noBottomPatterns = [...noHeaderPatterns];

  const hideHeader = noHeaderPatterns.some(pattern =>
    matchPath({ path: pattern, end: true }, pathname),
  );
  const hideBottom = noBottomPatterns.some(pattern =>
    matchPath({ path: pattern, end: true }, pathname),
  );

  return (
    <Box bgImage={`url(${bgImage})`} bgRepeat="repeat" bgSize="auto" minH="100dvh">
      {/* lg 이상: 좌우 2단 레이아웃 */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} w="100%" h="100dvh">
        {/* 왼쪽 설명 영역: lg 이상만 표시 */}
        <GridItem display={{ base: 'none', lg: 'flex' }}>
          <PcMent />
        </GridItem>

        {/* 오른쪽 앱 화면 */}
        <GridItem position="relative" display="flex" justifyContent="center" alignItems="center">
          {/* xs~mobile: 전체 너비 */}
          <Box display={{ base: 'block', mobile: 'none', lg: 'none' }} w="100%" h="100dvh">
            <Container
              maxW="560px"
              w="full"
              px={4}
              display="grid"
              gridTemplateRows="auto 1fr auto"
              h="100dvh"
              overflow="hidden"
              bg="white"
            >
              {!hideHeader && <AppHeader />}
              <Box as="main" overflowY="auto">
                <Outlet />
              </Box>
              {!hideBottom && <BottomNav />}
            </Container>
          </Box>

          {/* mobile~lg: 중앙 고정폭 520px */}
          <Box display={{ base: 'none', mobile: 'block', lg: 'none' }} w="520px" h="100dvh">
            <Container
              maxW="560px"
              w="full"
              px={4}
              display="grid"
              gridTemplateRows="auto 1fr auto"
              h="100dvh"
              overflow="hidden"
              bg="white"
            >
              {!hideHeader && <AppHeader />}
              <Box as="main" overflowY="auto">
                <Outlet />
              </Box>
              {!hideBottom && <BottomNav />}
            </Container>
          </Box>

          {/* lg 이상: 왼쪽 정렬된 앱 화면 (왼쪽 경계가 중앙) */}
          <Box
            position="absolute"
            left="0"
            w="520px"
            h="100dvh"
            bg="white"
            display={{ base: 'none', lg: 'block' }}
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
  );
}
