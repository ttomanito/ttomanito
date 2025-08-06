import React from 'react'
import {
  Box,
  VStack,
  Image,
  IconButton,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { FaQuestionCircle } from 'react-icons/fa'

import LongButton from '@/components/buttons/LongButton'

// 이미지 리소스
import main_page_logo from '@/assets/main_page_logo.svg'

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => (
  <Box
    bg="white"
    minH="100dvh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
  >
    {/* 물음표 아이콘 */}
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
      {/* 서비스 로고 */}
      <Image src={main_page_logo} alt="ttomanito logo" pr={4} />

      {/* 카카오 로그인 버튼 */}
      <LongButton
        w="full"
        onClick={() =>
          (window.location.href = '/api/oauth2/authorization/kakao')
        }
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

export default LoginPage
