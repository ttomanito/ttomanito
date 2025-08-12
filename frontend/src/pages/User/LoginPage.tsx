import React, { useState } from 'react'
import {
  Box,
  VStack,
  Image,
  IconButton,
  HStack,
  Text,
  Icon,
  Input,
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

/**
 * 개발용 유저 토큰 데이터.
 * 각 객체는 유저 ID와 해당 액세스 토큰을 포함합니다.
 */
const devUsers = [
  { id: 2, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNzU0NTQzNjYzLCJleHAiOjE3NTQ4ODkyNjN9.Ci2nd3YJucqv_fR-EtgLLmQwcWTHbEzd8km94HmUqxM' },
  { id: 10, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMCIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.wSM91ipSgHuj-iw3-8fT3JqvWIL9Y1BbBsPzY6sMRSI' },
  { id: 11, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMSIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.0eE-UZBVaUsdyjv1cFAkuby41kQKRDNEFYuKfy9EnUE' },
  { id: 12, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMiIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.XCAkotlLy1fJB-KpZEVlfPuW0tg-IYkHHWlf8gcXMHA' },
  { id: 13, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMyIsInVzZXJuYW1lIjoiMSIsImlhdCI6MTc1NDg3ODExMCwiZXhwIjoxNzU1MjIzNzEwfQ.Q3Jm1vAc5bvjZAdqGT79kasgO1fgP7ClQz_D-7n_OZ0' },
  { id: 100, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDAiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.Vz_iJU77kQLi44gW-g4mNBl_AyzeiC6Ktrk4badKnms' },
  { id: 101, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDEiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.l1T0_gOp0i4H-O7l6RxFobPcpo-7UxoPNqqWYYSx3cE' },
  { id: 102, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDIiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.uAivg9oDp68Fg8dsNSnySHjNbCBS9NBGFxEF8ypnBxc' },
  { id: 103, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDMiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.XBVFVnJCm6ov0Bwzx_J7cgjmOjAG4XJlnxaW7DP6fJM' },
  { id: 104, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDQiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.0ELWe-Cd90HLhbl34Ok5rBHWo489wij4SsHeX4Xvefc' },
  { id: 105, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDUiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.XJ4MdnYi2Rfm7F8tVgQ1CPJ4qYVCIgZrLHUovjNxSFk' },
  { id: 106, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDYiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.0ukc0Zd122gQLMvoPpOBWBmoWTs66Kl6261so1zcB1U' },
  { id: 107, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDciLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.qbRyKTSa8hyHQxNYKL-hyBIjEW9vRhOSWf6k7qhWdAg' },
  { id: 108, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDgiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.JycYFArjz1AFJ7MeZiKSoScle6STqac8w9BGpHptUZk' },
  { id: 109, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDkiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.-dP77yju46RxixIRB0-oJ0dp9DoOX24uFbPpP-wDnqA' },
  { id: 110, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTAiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.MbfLwybn9_Cr9rIrgLYQMLnDi_egUTRgslzbPR8S504' },
  { id: 111, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTEiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.NOluVAGZQ5p1JTY7l20NEX4ueWP2Wzl8nz-tfgGKnb8' },
  { id: 112, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTIiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.LP9Ev6gVbMj2yscg8-hSLzIbtR2Pz96nrcqj-3mUiV4' },
  { id: 113, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTMiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.yT9RQF_MyCmaajoiOkT5UENExdHUwfUY1UDtUtPY1R8' },
  { id: 114, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTQiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.9dllDFCTN-6N-DsFcWBcQi7H9NPkjAIVBuc0YEzQbvA' },
  { id: 115, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTUiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.2KlXY7xIpttvjZDvOq9E72p3-f_pdxa-FpLZXNOGalo' },
  { id: 116, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTYiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.tqboUeRNOzDJ79LIMhxmdywTu7CrKeAoociBb82ttI8' },
  { id: 117, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTciLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.cybJEznh59U12OM8LWhvyMDZ2RsQb5uW84VUwe4VzME' },
  { id: 118, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTgiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.wkKj0MOL9SK9dAl2vSlGn6xCX7wXPMkeDDL05MWK26k' },
  { id: 119, token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMTkiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE3NTQ5NzExMDgsImV4cCI6MTc1NTMxNjcwOH0.iP-HjJguJqesY_yqj8tHisKJz0PDn_gGXt9vTUqQyJc' },
];

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { openModal, closeModal } = useModalStore()
  const [devLoginId, setDevLoginId] = useState<string>('')

  // 입력된 ID로 로그인 처리
  const handleDevLogin = () => {
    const user = devUsers.find(u => u.id.toString() === devLoginId);
    if (!user) {
      alert('유효하지 않은 유저 ID입니다.');
      return;
    }
    const { token } = user;
    closeModal()
    const claims = jwtParser(token)
    useAuth.getState().setTokens({ accessToken: token, refreshToken: token })
    useAuth.getState().setUser({ id: claims.sub, name: claims.username })
    Cookies.set('accessToken', token, { expires: 1, path: '/' })
    Cookies.set('refreshToken', token, { expires: 7, path: '/' })
    navigate('/main')
  }

  // 개발자 로그인 모달 오픈
  const showDevLoginModal = () => {
    openModal({
      title: '개발자 로그인',
      body: (
        <VStack gap={4} align="stretch">
          <Input
            placeholder="유저 ID 입력 (예: 1, 2, 10)"
            value={devLoginId}
            onChange={(e) => setDevLoginId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
          />
          <LongButton onClick={handleDevLogin}>
            로그인
          </LongButton>
          <Text textStyle="caption_xs_light" color="gray.500" textAlign="center">
            사용 가능 ID: 2, 10~13, 100~119
            <br />
            2번 유저가 방장, 10, 11, 12, 13번은 참여자입니다.
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
          onClick={() => window.location.href = 'https://i13b206.p.ssafy.io/api/oauth2/authorization/kakao'}
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

        {/* 💻 개발용 로그인 버튼 */}
          <LongButton w="full" onClick={showDevLoginModal} bg="gray.200">
            <Text>💻 개발자 로그인</Text>
          </LongButton>
      </VStack>
    </Box>
  )
}

export default LoginPage