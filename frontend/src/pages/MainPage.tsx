import React, { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Image,
  Container,
  IconButton,
  Spinner,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react'

import LongButton from '@/components/buttons/LongButton'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { FaQuestionCircle } from 'react-icons/fa'
import axios from 'axios'

// 이미지 파일들
import main_page_logo from '@/assets/main_page_logo.svg'
import detectiveImg from '@/assets/detective_ttoma.svg'

const MainPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    axios
      .get('/api/auth/token', { withCredentials: true }) // 로그인 확인용
      .then((res) => {
        if (res.data?.accessToken) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  if (isLoggedIn === null) {
    return (
      <Box
        bg="white"
        minH="100dvh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" />
      </Box>
    )
  }

  if (isLoggedIn) {
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
              <LongButton w="full" bg="accent.500" _hover={{ bg: 'accent.600' }}>
                그룹 생성하기
              </LongButton>
              <LongButton w="full" bg="accent.500" _hover={{ bg: 'accent.600' }}>
                보고서 보러가기
              </LongButton>
            </VStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  // 로그인 안 된 경우 (카카오 로그인 버튼)
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

      <VStack gap={8} align="center">
        {/* 로고 */}
        <Image src={main_page_logo} alt="ttomanito logo" pr={4} />

        {/* 카카오 로그인 버튼 */}
        <LongButton
          onClick={() => (window.location.href = "https://i13b206.p.ssafy.io/api/oauth2/authorization/kakao")}
          bg="#FEE500"
          color="black"
          _hover={{ bg: '#FFEB33' }}
          _active={{ bg: '#FAD400' }}
        >
          <HStack gap={2} align="center">
            <Icon as={RiKakaoTalkFill} boxSize={5} />
            <Text>카카오 로그인</Text>
          </HStack>
        </LongButton>
      </VStack>
    </Box>
  )
}

export default MainPage
