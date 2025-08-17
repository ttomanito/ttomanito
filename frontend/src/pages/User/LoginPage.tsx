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
import main_page_logo from '@/assets/ttomas/main_page_logo.svg'
import TutorialBody from '@/components/modal/TutorialBody'
import { useModalStore } from '@/stores/modalStore'
// 새로 만든 모달 컴포넌트를 import 합니다.
// 파일 경로가 다를 경우 실제 경로에 맞게 수정해주세요.
import DevLoginModalBody from '@/components/modal/DevLoginModalBody' 

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => {
  const { openModal } = useModalStore()

  // 개발자 로그인 모달 오픈
  const showDevLoginModal = () => {
    openModal({
      title: '개발자 로그인',
      // 이제 body에 새로 만든 컴포넌트를 넣어주기만 하면 됩니다.
      body: <DevLoginModalBody />,
      footer: ''
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
          // onClick={() => (window.location.href = '/oauth2/authorization/kakao')}
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
{import.meta.env.DEV && (
  <LongButton w="full" onClick={showDevLoginModal} bg="gray.200">
    <Text>💻 개발자 로그인</Text>
  </LongButton>
)}
      </VStack>
    </Box>
  )
}

export default LoginPage