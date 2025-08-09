// src/pages/User/EditProfilePage.tsx

import { Box, Text, Field, HStack, Button } from '@chakra-ui/react';
import { useAuth } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '@/components/section/SectionHeader';
import LongButton from '@/components/buttons/LongButton';
import { useModalStore } from '@/stores/modalStore';
import TextInput from '@/components/inputs/TextInput';
import { postRequest, deleteRequest } from '@/api/requests';
import DoubleButton from '@/components/buttons/DoubleButton';

const updateUserName = async (name: string) => {
  return await postRequest('/user/update', undefined, {
    params: { name },
  });
};

const deleteUser = async () => {
  return await deleteRequest('/user/delete');
};

const EditProfilePage = () => {
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [error, setError] = useState('');
  const { openModal, closeModal } = useModalStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError('이름을 입력해주세요');
      openModal({
        title: '회원 정보 수정 실패',
        body: <Text>이름을 확인해주세요</Text>,
        footer: <LongButton onClick={closeModal}>확인</LongButton>,
      });
    } else {
      try {
        await updateUserName(name);
        setError('');
        openModal({
          title: '회원 정보 수정 성공',
          body: <Text>이름이 수정되었습니다</Text>,
          footer: <LongButton onClick={closeModal}>확인</LongButton>,
        });
      } catch (e) {
        openModal({
          title: '회원 정보 수정 실패',
          body: <Text>서버 오류가 발생했어요. 다시 시도해주세요.</Text>,
          footer: <LongButton onClick={closeModal}>확인</LongButton>,
        });
      }
    }
  };

    const handleDeleteClick = () => {
    openModal({
        title: '정말 탈퇴하시겠습니까?',
        body: <Text>탈퇴하면 모든 정보가 삭제되며 복구되지 않습니다.</Text>,
        footer: (
        <DoubleButton
            leftLabel="취소"
            rightLabel="확인"
            onLeftClick={closeModal}
            onRightClick={handleDeleteConfirm}
            leftProps={{ variant: 'ghost' }}
            rightProps={{ colorScheme: 'red' }}
        />
        ),
    });
    };

    const handleDeleteConfirm = async () => {
    try {
        await deleteUser();
        closeModal(); // 첫 번째 모달 닫기

        // ✅ 탈퇴 완료 안내 모달 띄우기
        openModal({
        title: '탈퇴 완료',
        body: <Text>정상적으로 탈퇴 처리되었습니다.</Text>,
        footer: (
            <LongButton
            w="full"
            onClick={() => {
                closeModal();     // 모달 닫고
                logout();         // 상태 초기화
                navigate('/login'); // 로그인 페이지로 이동
            }}
            >
            확인
            </LongButton>
        ),
        });
    } catch (e) {
        openModal({
        title: '회원 탈퇴 실패',
        body: <Text>서버 오류가 발생했어요. 다시 시도해주세요.</Text>,
        footer: <LongButton onClick={closeModal}>확인</LongButton>,
        });
    }
    };
    
  return (
    <Box
      position="relative"
      w="full"
      h="full"
      maxW="520px"
      mx="auto"
      px={4}
      pt={6}
      pb="72px"
    >
      <Box>
        <SectionHeader title="회원정보 수정" sub="수정할 수 있어요" />

        <Field.Root invalid={!!error}>
          <Field.Label>
            이름 <Field.RequiredIndicator />
          </Field.Label>

          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
          />

          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>

        <HStack justify="flex-end" mt={1}>
          <Button
            size="xs"
            variant="ghost"
            color="red.500"
            fontSize="xs"
            onClick={handleDeleteClick}
          >
            탈퇴하기
          </Button>
        </HStack>
      </Box>

      {/* 하단 버튼 고정 */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        px={4}
        py={4}
        bg="white"
      >
        <LongButton w="full" onClick={handleSubmit}>확인</LongButton>
      </Box>
    </Box>
  );
};

export default EditProfilePage;
