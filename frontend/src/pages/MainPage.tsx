import React from 'react'
import {
  Box,
  VStack,
  Image,
  Container,
  IconButton,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'     // ⬅️ 추가
import { FaQuestionCircle } from 'react-icons/fa'

import LongButton from '@/components/buttons/LongButton'
import detectiveImg from '@/assets/detective_ttoma.svg'
import { useModalStore } from '@/stores/modalStore';
import TutorialBody from '@/components/modal/TutorialBody'; 

const MainPage: React.FC = () => {
  const navigate = useNavigate()                  // ⬅️ 내비게이터 초기화
  const { openModal } = useModalStore()
  const tutorialModalData = {
    body: <TutorialBody />
  };

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
          bg: 'transparent' // ✨ 호버 시 배경색을 투명하게 설정
        }}
        // ✨ 6. onClick 핸들러에서 openModal을 호출합니다.
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
          <Image
            src={detectiveImg}
            alt="탐정 또마니또"
            w="100%"
            maxW="100%"
          />

          {/* 버튼 두 개 */}
          <VStack gap={4} w="full">
            <LongButton
              w="full"
              bg="accent.500"
              _hover={{ bg: 'accent.600' }}
              onClick={() => navigate('/room')}        // ⬅️ /room
            >
              그룹 생성하기
            </LongButton>

            <LongButton
              w="full"
              bg="accent.500"
              _hover={{ bg: 'accent.600' }}
              onClick={() => navigate('/report/reportlist')}  // ⬅️ /report/reportlist
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
