// src/components/layout/SideMenu.tsx
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
import logoSvg from '@/assets/ttomas/main_page_logo.svg';
import TutorialBody from '@/components/modal/TutorialBody';
import { useModalStore } from '@/stores/modalStore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore'; // ✅ 스토어 경로 통일

const MotionBox = motion(Box);

const SideMenu = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const tutorialModalData = { body: <TutorialBody /> };
  const [isOpen, setIsOpen] = useState(false);

  // ✅ 필요한 것만 타입 안전하게 셀렉트
  const status = useAuth((s) => s.gameInfo.status);
  const logout = useAuth((s) => s.logout);

  const close = () => setIsOpen(false);

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
    navigate(isInGame ? '/home' : '/'); // 라우터 가드가 / → /main 처리
    close();
  };

  return (
    <>
      {/* 메뉴 버튼 */}
      <Box p={2}>
      <IconButton
        aria-label="메뉴 열기"
        boxSize="35px"
        variant="ghost"
        onClick={() => setIsOpen(true)}
      >
        < LuMenu style={{ width: '35px', height: '35px' }} />
        
      </IconButton>

      </Box>

      {/* 사이드 메뉴 및 백드롭 */}
      <AnimatePresence>
        {isOpen && containerRef.current && (
          <Portal container={containerRef}>
            {/* Backdrop */}
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

            {/* Drawer */}
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
                    {/* ✅ 로고 클릭 이동 */}
                    <Box
                      as="button"
                      onClick={handleLogoClick}
                      cursor="pointer"
                      aria-label="메인으로 이동"
                    >
                      <Image src={logoSvg} alt="또마니또 로고" h="40x" />
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
