// components/layout/AppHeader.tsx
import { Flex } from '@chakra-ui/react';
import SideMenu from './SideMenu'; // ✅ 추가

const AppHeader = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="100%"           // 너비를 명시적으로 설정
      px={2}             // 좌우 패딩 추가 (다른 콘텐츠와 맞춤)
      py={2}             // 상하 패딩 추가
      boxSizing="border-box"  // 패딩이 너비에 포함되도록
    >
      {/* 왼쪽: 사이드 메뉴 트리거 */}
      <SideMenu containerRef={containerRef} />

    </Flex>
  );
};

export default AppHeader;
