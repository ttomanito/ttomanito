import React from 'react' // 🔥 변경: useEffect 제거
import {
  Box,
  VStack,
  Container,
  IconButton,
  AspectRatio,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FaQuestionCircle } from 'react-icons/fa'

import LongButton from '@/components/buttons/LongButton'
import { useModalStore } from '@/stores/modalStore'
import { useAuth } from '@/stores/authStore'
import TutorialBody from '@/components/modal/TutorialBody'

const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const { openModal } = useModalStore()
  const { 
    gameInfo // 🔥 변경: checkUserGameStatus, isAuthenticated 제거 (불필요)
  } = useAuth()

  const tutorialModalData = {
    body: <TutorialBody />
  }

  // 🔥 제거: useEffect 불필요 (onRehydrateStorage에서 이미 상태 동기화 완료)

  // 첫 번째 버튼 텍스트와 동작 결정
  const getMainButtonConfig = () => {
    switch (gameInfo.status) { // 🔥 변경: userGameStatus → gameInfo.status
      case 'IN_WAITING':
        return {
          text: '현재 대기방으로 이동',
          action: () => navigate(`/room/${gameInfo.roomId}`), // 🔥 변경: currentRoomId → gameInfo.roomId
          color: 'yellow.500',
          hoverColor: 'yellow.600'
        }
      case 'IN_GAME':
        // 게임 중이면 이 페이지에 올 수 없지만, 혹시 모를 경우를 위해
        return {
          text: '게임 계속하기',
          action: () => navigate('/home'),
          color: 'green.500',
          hoverColor: 'green.600'
        }
      default: // 'IN_NONE'
        return {
          text: '그룹 생성하기',
          action: () => navigate('/room'),
          color: 'accent.500',
          hoverColor: 'accent.600'
        }
    }
  }

  const mainButtonConfig = getMainButtonConfig()

  return (
    <Box
      bg="white"
      minH="100dvh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {/* ? 아이콘 */}
      <IconButton
        aria-label="정보"
        variant="ghost"
        position="absolute"
        top={3}
        right={3}
        zIndex="docked"
        color="accent.500"
        _hover={{ 
          color: 'accent.700', 
          bg: 'transparent'
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
        justifyContent="center"
        alignItems="center"
        px={4}
        pt={8}
        pb={12}
      >
        <VStack gap={12} w="full" align="center">
          
          {/* 탐정 또마니또 이미지 크게 */}
          <Box w="100%" h="500px">
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
                  objectFit: 'cover',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                }}
              />
            </AspectRatio>
          </Box>

          {/* 버튼 두 개 */}
          <VStack gap={4} w="full">
            {/* 🔥 상태별 동적 버튼 */}
            <LongButton
              w="full"
              bg={mainButtonConfig.color}
              _hover={{ bg: mainButtonConfig.hoverColor }}
              onClick={mainButtonConfig.action}
            >
              {mainButtonConfig.text}
            </LongButton>

            {/* 보고서 버튼은 항상 표시 */}
            <LongButton
              w="full"
              bg="accent.500"
              _hover={{ bg: 'accent.600' }}
              onClick={() => navigate('/report/reportlist')}
            >
              보고서 보러가기
            </LongButton>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}

export default MainPage