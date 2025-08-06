import React, { useState } from 'react'
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
import { useAuth } from '@/stores/authStore' // ✅ 임시 로그인용 스토어 접근
import main_page_logo from '@/assets/main_page_logo.svg'

import TutorialBody from '@/components/modal/TutorialBody'; // ✨ 1. TutorialBody 컴포넌트 import
import { useModalStore } from '@/stores/modalStore'; // ✨ 2. Zustand 스토어 import

/** 카카오 로그인 전용 페이지 (/login) */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // ✨ 3. openModal, closeModal 함수를 스토어에서 가져옵니다.
  const { openModal } = useModalStore();
  // ✨ 4. useState는 더 이상 필요 없으므로 제거합니다.
  // const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  // 개발용 임시 로그인 함수
  const handleDevLogin = () => {
    // ... (handleDevLogin 내용은 이전과 동일)
    useAuth.getState().setTokens({
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiLquLjtg5zsnYAiLCJpYXQiOjE3NTQzNTkxMjAsImV4cCI6MTc1NDM2MDAyMH0.kDScLtGaLvTkEosWvLXy7rXJOElY3eCmB-mTRB6iFzY',
      refreshToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU0MzU5MTIwLCJleHAiOjE3NTQ0NDU1MjB9.jCXeYCCKoHB3fRsBSNe3lxTSL-pzOzw1cSFY-BjgbaU',
    });
    useAuth.getState().setUser({ id: '2', name: '개발자' });
    Cookies.set('accessToken', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiLquLjtg5zsnYAiLCJpYXQiOjE3NTQzNTkxMjAsImV4cCI6MTc1NDM2MDAyMH0.kDScLtGaLvTkEosWvLXy7rXJOElY3eCmB-mTRB6iFzY', { expires: 1, path: '/' });
    Cookies.set('refreshToken', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU0MzU5MTIwLCJleHAiOjE3NTQ0NDU1MjB9.jCXeYCCKoHB3fRsBSNe3lxTSL-pzOzw1cSFY-BjgbaU', { expires: 7, path: '/' });
    navigate('/main');
  };

  // ✨ 5. 튜토리얼 모달에 필요한 데이터를 객체로 정의합니다.
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
      {/* 물음표 아이콘 */}
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

        {/* 💻 개발용 임시 로그인 버튼 */}
        {import.meta.env.DEV && (
          <LongButton w="full" onClick={handleDevLogin} bg="gray.200">
            <Text>💻 개발용 로그인 (임시 토큰)</Text>
          </LongButton>
        )}
      </VStack>
      
      {/* ✨ 7. 페이지 내에서 직접 모달을 렌더링하는 코드를 제거합니다. */}
    </Box>
  );
};

export default LoginPage;