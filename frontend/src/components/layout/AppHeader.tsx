// components/layout/AppHeader.tsx
import { Flex, Image } from '@chakra-ui/react';
import { useAuth } from '@/stores/authStore';

const AppHeader = () => {

  const handleLogout = () => {
    useAuth.getState().logout();
    window.location.href = '/login';
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      pt={2}
      mb={2}
      py={4}
      px={4}
    >
      {/* 로고 → 클릭 시 로그아웃 */}
      <Image
        src="@assets/logo.svg"
        boxSize={10}
        alt="logo"
        cursor="pointer"
        onClick={handleLogout}
      />

      {/* 오른쪽 아이콘 */}
      <Flex gap={4}>
        <Image src="@assets/bellicon.svg" boxSize={12} alt="알림" />
        <Image src="@assets/menuicon.svg" boxSize={14} alt="메뉴" />
      </Flex>
    </Flex>
  );
};

export default AppHeader;
