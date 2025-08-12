import { useState } from 'react';
import { VStack, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import LongButton from '@/components/buttons/LongButton';
import { postRequest } from '@/api/requests'; // 또는 { api } from '@/api/client'

const DevLoginModalBody: React.FC = () => {
  const navigate = useNavigate();
  const { closeModal } = useModalStore();
  const [devLoginId, setDevLoginId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async () => {
    if (!devLoginId.trim()) {
      alert('유저 ID를 입력해주세요.');
      return;
    }

    setLoading(true);
  try {
    // 1. 개발용 로그인 요청 (쿠키만 설정됨, HTML 응답 무시)
    await postRequest('/auth/dev/login', { 
      userId: Number(devLoginId) 
    });
    
    // 2. 🔥 authStore의 bootstrapFromServer 호출
    await useAuth.getState().bootstrapFromServer();
    
    console.log('로그인 완료');
    closeModal();
    navigate('/main');
    
  } catch (error) {
    console.error('개발 로그인 실패:', error);
    alert('로그인에 실패했습니다.');
  } finally {
    setLoading(false);
  }
  };

  return (
    <VStack gap={4} align="stretch">
      <Input
        placeholder="유저 ID 입력 (예: 1, 2, 100)"
        value={devLoginId}
        onChange={(e) => setDevLoginId(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
        disabled={loading}
      />
      <LongButton onClick={handleDevLogin} disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </LongButton>
      <Text textStyle="caption_xs_light" color="gray.500" textAlign="center">
        개발용 빠른 로그인
        <br />
        원하는 유저 ID를 입력하세요
      </Text>
    </VStack>
  );
};

export default DevLoginModalBody;