import React from 'react'
import {
  Box,
  VStack,
  Image,
  Container,
  IconButton
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import LongButton from '@/components/buttons/LongButton'
import { FaQuestionCircle } from 'react-icons/fa'
import detectiveImg from '@/assets/detective_ttoma.svg'

const MainPage2: React.FC = () => {
  const navigate = useNavigate()

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
              onClick={() => navigate('/room')}
            >
              그룹 생성하기
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
        </VStack>
      </Container>
    </Box>
  )
}

export default MainPage2
