import { postRequest } from '@/api/requests';
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
  const { syncUserGameStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const status = useAuth((s) => s.gameInfo.status);
  const isCreator = useAuth((s) => s.gameInfo.isCreator);
  const roomId = useAuth((s) => s.gameInfo.roomId);

  const logout = useAuth((s) => s.logout);

  const close = () => setIsOpen(false);
  const finishRoom = async () => {
    try {
      await postRequest('/manito/finish');
      await postRequest(`/notice/${roomId}/finish`)
      await syncUserGameStatus();
      close();
      navigate('/main');
    } catch {
      close();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      close();
    } catch {
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
              right={0}
              w="280px"
              h="100dvh"
              bg="white"
              zIndex="modal"
              boxShadow="lg"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.25 }}
            >
              <VStack align="stretch" gap={4} p={4}>
                <HStack justify="space-between">
                  <HStack gap={2}>
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
                    textStyle="body_sm"
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
                    textStyle="body_sm"
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
                    textStyle="body_sm"
                    onClick={() => {
                      navigate('/user/update');
                      close();
                    }}
                  >
                    회원 정보 수정
                  </Button>
                </VStack>
              </VStack>

              {/* 하단 버튼 그룹 */}
              <VStack align="stretch" px={4} pb={6}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  color="red.500"
                  textStyle="body_sm"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
                {status === 'IN_GAME' && isCreator && (
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    py={6}
                    textStyle="boddy_sm"
                    color="red.500"
                    onClick={finishRoom}
                  >
                    방 종료하기
                  </Button>
                )}
              </VStack>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideMenu;