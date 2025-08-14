import { postRequest } from '@/api/requests'; // ✅ API 유틸 불러오기
import { useAuth } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/stores/modalStore';
import TutorialBody from '@/components/modal/TutorialBody';
import logoSvg from '@/assets/ttomas/main_page_logo.svg';
import {
  Box,
  VStack,
  HStack,
  Image,
  IconButton,
  Button,
  CloseButton,
  Portal,
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const SideMenu = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const tutorialModalData = { body: <TutorialBody /> };

  const [isOpen, setIsOpen] = useState(false);

  const status = useAuth((s) => s.gameInfo.status);
  const isCreator = useAuth((s) => s.gameInfo.isCreator);

  const logout = useAuth((s) => s.logout);

  const close = () => setIsOpen(false);
  console.log({ status, isCreator })
  // ✅ API 호출을 postRequest로 변경
  const finishRoom = async () => {
    try {
      await postRequest('/manito/finish'); // 데이터 바디 필요 없으므로 두 번째 인자 생략
      close();
      navigate('/home'); // 게임 종료 후 홈으로 이동
    } catch (error) {
      console.error('방 종료 실패:', error);
      close();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      close();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      close();
    }
  };

  const handleLogoClick = () => {
    const isInGame = status === 'IN_GAME';
    navigate(isInGame ? '/home' : '/');
    close();
  };

  return (
    <>
      {/* 메뉴 열기 버튼 */}
      <Box p={2}>
        <IconButton
          aria-label="메뉴 열기"
          boxSize="35px"
          variant="ghost"
          onClick={() => setIsOpen(true)}
        >
          <LuMenu style={{ width: '35px', height: '35px' }} />
        </IconButton>
      </Box>

      {/* 사이드 메뉴 & 백드롭 */}
      <AnimatePresence>
        {isOpen && containerRef.current && (
          <Portal container={containerRef}>
            {/* 백드롭 */}
            <MotionBox
              bg="blackAlpha.400"
              position="absolute"
              inset={0}
              zIndex="overlay"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* 드로어 */}
            <MotionBox
              position="absolute"
              top={0}
              left={0}
              w="280px"
              h="100dvh"
              bg="white"
              zIndex="modal"
              boxShadow="lg"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25 }}
            >
              <VStack align="stretch" gap={4} p={4}>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    {/* 로고 클릭 */}
                    <Box
                      as="button"
                      onClick={handleLogoClick}
                      cursor="pointer"
                      aria-label="메인으로 이동"
                    >
                      <Image src={logoSvg} alt="또마니또 로고" h="40px" />
                    </Box>
                  </HStack>
                  <CloseButton variant="ghost" size="sm" onClick={close} />
                </HStack>

                <VStack align="stretch" gap={1}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    py={6}
                    textStyle="title_md"
                    onClick={() => {
                      openModal(tutorialModalData);
                      close();
                    }}
                  >
                    튜토리얼 확인하기
                  </Button>

                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    py={6}
                    textStyle="title_md"
                    onClick={() => {
                      navigate('/report/reportlist');
                      close();
                    }}
                  >
                    보고서 보러가기
                  </Button>

                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    py={6}
                    textStyle="title_md"
                    onClick={() => {
                      navigate('/user/update');
                      close();
                    }}
                  >
                    회원 정보 수정
                  </Button>

                  {/* ✅ 방 종료 버튼 - 게임 중 + 방장일 때만 */}
                  {status === 'IN_GAME' && isCreator && (
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      py={6}
                      textStyle="title_md"
                      color="red.500"
                      onClick={finishRoom}
                    >
                      방 종료하기
                    </Button>
                  )}
                </VStack>
              </VStack>

              <Box px={4} pb={6}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  color="red.500"
                  textStyle="title_md"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </Box>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideMenu;
