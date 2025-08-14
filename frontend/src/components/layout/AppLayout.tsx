import { useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  Flex,
  Image,
  Portal,
} from '@chakra-ui/react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import bgImage from '@/assets/imgs/profile_bg.png';
import detective_ttoma_img from '@/assets/ttomas/detective_ttoma.svg';
import logo_ttomanito from '@/assets/ttomas/logo_ttomanito.svg';
import { useModalStore } from '@/stores/modalStore';
import BaseModal from '@/components/modal/BaseModal';
import InstallBanner from '@/components/ui/InstallBanner';
import type { PageFrame } from './pageFrame'
import BackBar from './BackBar';

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

const frameRules: Array<{ frame: PageFrame; patterns: string[] }> = [
  { // 헤더 + 하단바
  frame: 'full',
  patterns: [
    '/home', '/guess', '/chat', '/rank' 
  ]
},
{ // 헤더 O + 하단바 X
  frame: 'header-only',
  patterns: [
    '/main', '/manito/:roomId/matching', '/report/reportlist'
  ]
},
{ // 뒤로 가기만
  frame: 'back-only',
  patterns: [
   '/user/update', '/room', '/room/:roomId', '/chat/:chatRoomId', '/report/reportlist/:reportId'
  ]
},
{ // 헤더 X + 하단바 X
  frame: 'bare',
  patterns: [
    '/', '/login', '/chat/:chatRoomId/call'
  ]
},
];

const getFrame = (pathname: string): PageFrame => {
  for (const { frame, patterns } of frameRules) {
    if (patterns.some((p) => matchPath({ path: p, end: true }, pathname))) {
      return frame;
    }
  }
  return 'full';
};

export default function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { isModalOpen, closeModal, modalTitle, modalBody, modalCaption, modalFooter } =
    useModalStore();

  const frame = getFrame(pathname);

  // ② 프레임별 레이아웃 행 구성(상/중/하)
  // - full, header-only: "auto 1fr auto"
  // - back-only: "auto 1fr"
  // - bare: "1fr"
  const rows =
    frame === 'full' || frame === 'header-only'
      ? 'auto 1fr auto'
      : frame === 'back-only'
      ? 'auto 1fr'
      : '1fr'; // bare

  return (
    <Box bgImage={`url(${bgImage})`} bgRepeat="repeat" bgSize="auto" minH="100dvh">
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} w="100%" h="100dvh">
        <GridItem display={{ base: 'none', lg: 'flex' }} alignItems="center" justifyContent="flex-start">
          <PcMent />
        </GridItem>

        <GridItem display="flex" justifyContent="center" alignItems="center" position="relative">
          <Portal container={containerRef}>
            <BaseModal
              open={isModalOpen}
              onClose={closeModal}
              caption={modalCaption}
              title={modalTitle}
              body={modalBody}
              footer={modalFooter}
            />
          </Portal>

          <Box
            ref={containerRef}
            position="relative"
            w={{ base: '375px', xs: '100%', mobile: '520px' }}
            h="100dvh"
            overflow="hidden"
          >
            <Container
              maxW="560px"
              w="full"
              px={0}
              py={1}
              display="grid"
              gridTemplateRows={rows}
              h="100dvh"
              overflow="hidden"
              bg="white"
              boxSizing="border-box"
            >
              {/* 상단 영역 */}
              {frame === 'full' && <AppHeader containerRef={containerRef} />}
              {frame === 'header-only' && <AppHeader containerRef={containerRef} />}
              {frame === 'back-only' && <BackBar />}

              {/* 메인 컨텐츠 */}
              <Box as="main" overflowY="auto">
                <Outlet />
              </Box>

              {/* 하단 네비게이션 */}
              {frame === 'full' ? <BottomNav /> : null}

              <InstallBanner />
            </Container>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}