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
import Cookies from 'js-cookie'
import LongButton from '@/components/buttons/LongButton'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth' // ✅ 임시 로그인용 스토어 접근

// 이미지 리소스
import main_page_logo from '@/assets/main_page_logo.svg'

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  
  // 개발용 임시 로그인 함수
  const handleDevLogin = () => {
    useAuth.getState().setTokens({
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiLquLjtg5zsnYAiLCJpYXQiOjE3NTQzNTkxMjAsImV4cCI6MTc1NDM2MDAyMH0.kDScLtGaLvTkEosWvLXy7rXJOElY3eCmB-mTRB6iFzY',
      refreshToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU0MzU5MTIwLCJleHAiOjE3NTQ0NDU1MjB9.jCXeYCCKoHB3fRsBSNe3lxTSL-pzOzw1cSFY-BjgbaU',
    })
    useAuth.getState().setUser({
      id: '2',
      name: '개발자',
    })  
    // 쿠키에도 저장 (백엔드처럼 작동하도록 테스트)
      Cookies.set('accessToken', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiLquLjtg5zsnYAiLCJpYXQiOjE3NTQzNTkxMjAsImV4cCI6MTc1NDM2MDAyMH0.kDScLtGaLvTkEosWvLXy7rXJOElY3eCmB-mTRB6iFzY', { expires: 1, path: '/' });
      Cookies.set('refreshToken', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU0MzU5MTIwLCJleHAiOjE3NTQ0NDU1MjB9.jCXeYCCKoHB3fRsBSNe3lxTSL-pzOzw1cSFY-BjgbaU', { expires: 7, path: '/' });

    navigate('/main') // ✅ 로그인 후 메인 페이지로 이동
  }

  return (
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

        {/* 💻 개발용 임시 로그인 버튼 (DEV 환경에서만 표시) */}
        {import.meta.env.DEV && (
          <LongButton w="full" onClick={handleDevLogin} bg="gray.200">
            <Text>💻 개발용 로그인 (임시 토큰)</Text>
          </LongButton>
        )}
      </VStack>
    </Box>
  )
}

export default LoginPage
