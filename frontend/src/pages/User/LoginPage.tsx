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
import { useAuth } from '@/stores/authStore'
import main_page_logo from '@/assets/ttomas/main_page_logo.svg'
import TutorialBody from '@/components/modal/TutorialBody'
import { useModalStore } from '@/stores/modalStore'
import { jwtParser } from '@/utils/jwtparser'

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { openModal, closeModal } = useModalStore()

  // 개발용 액세스 토큰 목록
  const devTokens: string[] = [
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0NTQzNjYzLCJleHAiOjE3NTQ4ODkyNjN9.l8SbHlasPMm1WkP2xSuTC3xBuhTtPOytejGpiByCal8',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0NTQzNjYzLCJleHAiOjE3NTQ4ODkyNjN9.Ci2nd3YJucqv_fR-EtgLLmQwcWTHbEzd8km94HmUqxM',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0NTQzNjYzLCJleHAiOjE3NTQ4ODkyNjN9.na_XUDhhyVrlow307Voz8U2SKG8XexQl5uGqYP8hHz4',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0NTQzNjYzLCJleHAiOjE3NTQ4ODkyNjN9.zW6Td3CfzB8bU0Lv7Cjq95BDI5gOj4mFJS8MuB2bPiw',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMCIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.wSM91ipSgHuj-iw3-8fT3JqvWIL9Y1BbBsPzY6sMRSI',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMSIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.0eE-UZBVaUsdyjv1cFAkuby41kQKRDNEFYuKfy9EnUE',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMiIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.XCAkotlLy1fJB-KpZEVlfPuW0tg-IYkHHWlf8gcXMHA',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMyIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.Q3Jm1vAc5bvjZAdqGT79kasgO1fgP7ClQz_D-7n_OZ0',
  ]

  // 선택한 토큰으로 로그인 처리
  const handleDevLoginWithToken = (token: string) => {
    closeModal()
    const claims = jwtParser(token)
    useAuth.getState().setTokens({ accessToken: token, refreshToken: token })
    useAuth.getState().setUser({ id: claims.sub, name: claims.username })
    Cookies.set('accessToken', token, { expires: 1, path: '/' })
    Cookies.set('refreshToken', token, { expires: 7, path: '/' })
    navigate('/main')
  }

  // 개발자 로그인 선택 모달 오픈
  const showDevLoginModal = () => {
    openModal({
      title: '개발자 로그인 선택',
      body: (
        <VStack gap={3} align="stretch">
  {devTokens.map((token, idx) => {
    // 앞 4개: 1~4, 뒤 4개: 10~13
    const label = idx < 4 ? idx + 1 : 10 + (idx - 4);
    return (
      <LongButton key={idx} onClick={() => handleDevLoginWithToken(token)}>
        {`User ${label}`}
      </LongButton>
    );
  })}
          <Text textStyle="caption_xs_light" color="gray.500" textAlign="center">
           2번이 방장, 10 11 12 13은 참여자
            (마니또 마니띠 관계는 db에서 확인)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
          </Text>
        </VStack>
      ),
    })
  }

  // 튜토리얼 모달 데이터
  const tutorialModalData = { body: <TutorialBody /> }

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
        _hover={{ color: 'accent.700', bg: 'transparent' }}
        onClick={() => openModal(tutorialModalData)}
      >
        <FaQuestionCircle style={{ width: '40px', height: '40px' }} />
      </IconButton>

      <VStack gap={8} align="center">
        {/* 서비스 로고 */}
        <Image src={main_page_logo} alt="ttomanito logo" pr={4} />

        {/* 카카오 로그인 버튼 */}
        <LongButton
          w="full"
          onClick={() => (window.location.href = '/api/oauth2/authorization/kakao')}
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

        {/* 💻 개발용 로그인 선택 버튼 */}
        {import.meta.env.DEV && (
          <LongButton w="full" onClick={showDevLoginModal} bg="gray.200">
            <Text>💻 개발자 로그인 선택</Text>
          </LongButton>
        )}
      </VStack>
    </Box>
  )
}

export default LoginPage