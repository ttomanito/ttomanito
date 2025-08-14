import { Flex, HStack, Image, Box, type FlexProps } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

import homeIcon from '@/assets/nav_icons/homeicon.svg';
import chatIcon from '@/assets/nav_icons/chaticon.svg';
import guessIcon from '@/assets/nav_icons/guessicon.svg';
import rankingIcon from '@/assets/nav_icons/rankingicon.svg';

type NavItem = {
  to: string;
  label: string;
  icon: string;
};

type BottomNavProps = FlexProps & {
  items?: NavItem[];
  height?: number | string;
  /** 아이콘 지름(px) */
  iconSize?: number;
  /** 버튼(원) 지름(px) */
  buttonSize?: number;
  /** 아이콘 간 간격 */
  gap?: number | string;
};

const DEFAULT_ITEMS: NavItem[] = [
  { to: '/home', label: '홈', icon: homeIcon },
  { to: '/chat', label: '채팅', icon: chatIcon },
  { to: '/guess', label: '추측', icon: guessIcon },
  { to: '/rank', label: '랭킹', icon: rankingIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({
  items = DEFAULT_ITEMS,
  height = '60px',
  iconSize = 42,    // 아이콘 실제 크기
  buttonSize = 55,  // 동그란 버튼 지름
  gap = 2,
  ...props
}) => {
  const location = useLocation();
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Flex
      as="nav"
      role="navigation"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      h={height}
      align="center"
      px={4}
      py={3}
      {...props}
    >
      <HStack w="100%" justify="space-between" gap={gap}>
        {items.map(({ to, icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                rounded="full"
                boxSize={`${buttonSize}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={active ? 'accent.200' : 'transparent'}
                _hover={{ bg: 'accent.100' }}
                _active={{ bg: 'accent.200' }}
                boxShadow={active ? 'sm' : 'none'}
                transition="background-color 0.15s ease"
              >
                <Image
                  src={icon}
                  alt={label}
                  boxSize={`${iconSize}px`}
                  draggable={false}
                  // 선택 시 살짝 진하게
                  filter={active ? 'none' : 'grayscale(0%)'}
                />
              </Box>
            </Link>
          );
        })}
      </HStack>
    </Flex>
  );
};

export default BottomNav;
