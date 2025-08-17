import { Flex, HStack, VStack, Icon, type FlexProps } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { LuHouse, LuMessageCircle, LuCircleCheckBig, LuTrophy } from 'react-icons/lu';
import type { IconType } from 'react-icons';

type NavItem = {
  to: string;
  label: string;
  icon: IconType;
};

type BottomNavProps = FlexProps & {
  items?: NavItem[];
  activeColor?: string;
  inactiveColor?: string;
  height?: number | string;
};

const DEFAULT_ITEMS: NavItem[] = [
  { to: '/home', label: '홈', icon: LuHouse },
  { to: '/chat', label: '채팅', icon: LuMessageCircle },
  { to: '/guess', label: '추측', icon: LuCircleCheckBig },
  { to: '/ranking', label: '랭킹', icon: LuTrophy },
];

const BottomNav: React.FC<BottomNavProps> = ({
  items = DEFAULT_ITEMS,
  activeColor = '#a4b8fbff',
  inactiveColor = 'gray.500',
  height = '64px',
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
      justify="space-around"
      {...props}
    >
      <HStack w="100%" justify="space-around">
        {items.map(({ to, icon: IconComp }) => {
          const active = isActive(to);
          const color = active ? activeColor : inactiveColor;
          return (
            <Link key={to} to={to} style={{ width: '100%' }}>
              <VStack gap={0.5}>
                <Icon as={IconComp} color={color} boxSize={6} />
              </VStack>
            </Link>
          );
        })}
      </HStack>
    </Flex>
  );
};

export default BottomNav;
