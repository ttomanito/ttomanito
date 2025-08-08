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



export default function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { pathname } = useLocation();
  const { isModalOpen, closeModal, modalTitle, modalBody, modalCaption, modalFooter } =
    useModalStore();

  const noHeaderPatterns = [
    '/chat/:chatRoomId/call',
    '/room',
    '/login',
  ];
  const noBottomPatterns = [
    '/chat/:chatRoomId/call',
    '/',
    '/main',
    '/room',
    '/login',
    '/register',
    '/room/:roomId',
    '/manito/:roomId/matching',
    '/user/update'];

  const hideHeader = noHeaderPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  );
  const hideBottom = noBottomPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  );

  return (
    <Box
      bgImage={`url(${bgImage})`}
      bgRepeat="repeat"
      bgSize="auto"
      minH="100dvh"
    >
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        w="100%"
        h="100dvh"
      >
        <GridItem display={{ base: 'none', lg: 'flex' }} alignItems="center" justifyContent="flex-start">
          <PcMent />
        </GridItem>
        
        <GridItem
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
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
            // ✨ 3단계 반응형 너비 설정
            w={{ base: '375px', xs: '100%', mobile: '520px' }}
            h="100dvh"
            overflow="hidden"
          >
            
            <Container
              maxW="560px"
              w="full"
              px={0}
              display="grid"
              gridTemplateRows="auto 1fr auto"
              h="100dvh"
              overflow="hidden"
              bg="white"
            >
              {!hideHeader && <AppHeader containerRef={containerRef} />}
              <Box as="main" overflowY="auto">
                <Outlet />
              </Box>
              {!hideBottom && <BottomNav />}
              <InstallBanner />
            </Container>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}