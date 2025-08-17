import React from 'react'; 
import { Box, VStack, Container, IconButton, AspectRatio } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from 'react-icons/fa';

import LongButton from '@/components/buttons/LongButton';
import { useModalStore } from '@/stores/modalStore';
import { useAuth } from '@/stores/authStore';
import TutorialBody from '@/components/modal/TutorialBody';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const {
    gameInfo, 
  } = useAuth();

  const tutorialModalData = {
    body: <TutorialBody />,
  };

  const getMainButtonConfig = () => {
    switch (
      gameInfo.status 
    ) {
      case 'IN_WAITING':
        return {
          text: '현재 대기방으로 이동',
          action: () => navigate(`/room/${gameInfo.roomId}`),
          color: 'yellow.500',
          hoverColor: 'yellow.600',
        };
      case 'IN_GAME':
        return {
          text: '게임 계속하기',
          action: () => navigate('/home'),
          color: 'green.500',
          hoverColor: 'green.600',
        };
      default: // 'IN_NONE'
        return {
          text: '그룹 생성하기',
          action: () => navigate('/room'),
          color: 'accent.500',
          hoverColor: 'accent.600',
        };
    }
  };

  const mainButtonConfig = getMainButtonConfig();

  return (
    <Box bg="white" h="100%" display="flex">
      {/* ? 아이콘 */}
      <IconButton
        aria-label="정보"
        variant="ghost"
        position="absolute"
        top={3}
        left={3}
        zIndex="docked"
        color="accent.500"
        _hover={{
          color: 'accent.700',
          bg: 'transparent',
        }}
        onClick={() => openModal(tutorialModalData)}
      >
        <FaQuestionCircle style={{ width: '40px', height: '40px' }} />
      </IconButton>

      <Container
        maxW="480px"
        flex="1"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <VStack gap={12} w="full" align="center">
          {/* 탐정 또마니또 이미지 크게 */}
          <Box w="100%" minH="250px" h="70dvh">
            <AspectRatio ratio={9 / 10} w="100%" h="100%">
              <video
                src="/videos/demo-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                }}
              />
            </AspectRatio>
          </Box>
        </VStack>

        <VStack gap={4} w="full" as="footer" position="sticky" bottom="6">
          <LongButton
            w="full"
            bg={mainButtonConfig.color}
            _hover={{ bg: mainButtonConfig.hoverColor }}
            onClick={mainButtonConfig.action}
          >
            {mainButtonConfig.text}
          </LongButton>

          <LongButton
            w="full"
            bg="accent.500"
            _hover={{ bg: 'accent.600' }}
            onClick={() => navigate('/report/reportlist')}
          >
            보고서 보러가기
          </LongButton>
        </VStack>
      </Container>
    </Box>
  );
};

export default MainPage;
