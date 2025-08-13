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
import { TiThMenu } from 'react-icons/ti';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSvg from '@/assets/ttomas/main_page_logo.svg';
import TutorialBody from '@/components/modal/TutorialBody'
import { useModalStore } from '@/stores/modalStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/authStore'; // 기존 경로 유지

const MotionBox = motion(Box);

const SideMenu = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const navigate = useNavigate()  
  const { openModal } = useModalStore()
  const tutorialModalData = { body: <TutorialBody /> }
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth(); // 🔥 수정: 구조분해할당으로 변경

  const close = () => setIsOpen(false);

  // 🔥 추가: 로그아웃 에러 처리
  const handleLogout = async () => {
    try {
      await logout();
      close();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 있어도 메뉴는 닫기
      close();
    }
  };

  return (
    <>
      {/* 메뉴 버튼 */}
      <Box p={2}>
      <IconButton
        aria-label="메뉴 열기"
        boxSize="40px"
        variant="ghost"
        onClick={() => setIsOpen(true)}
      >
        <TiThMenu style={{ width: '40px', height: '40px' }} />
        
      </IconButton>
      </Box>
      {/* 사이드 메뉴 및 백드롭 */}
      <AnimatePresence>
        {isOpen && containerRef.current && (
          <Portal container={containerRef}>
            {/* ✅ 백드롭 */}
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

            {/* ✅ 사이드 메뉴 */}
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
                    <Image src={logoSvg} alt="또마니또 로고" h="40x" />
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
                      close(); // 메뉴 닫기
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
                      close(); // 메뉴 닫기
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
                      close(); // 메뉴 닫기
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
                  onClick={handleLogout} // 🔥 수정: 에러 처리가 포함된 함수 사용
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