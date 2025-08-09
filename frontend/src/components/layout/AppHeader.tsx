// components/layout/AppHeader.tsx
import { Flex } from '@chakra-ui/react';
import SideMenu from './SideMenu'; // ✅ 추가

const AppHeader = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      mb={1}
    >
      {/* 왼쪽: 사이드 메뉴 트리거 */}
      <SideMenu containerRef={containerRef} />

    </Flex>
  );
};

export default AppHeader;
