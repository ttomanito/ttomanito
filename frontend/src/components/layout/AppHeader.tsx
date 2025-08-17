import { Flex, HStack, IconButton } from '@chakra-ui/react';
import { HiBell } from 'react-icons/hi'; 
import { useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu'; 

const AppHeader = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const navigate = useNavigate();
  const handleNotificationClick = () => {
    navigate('/alarm');
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="flex-end"
      w="100%"      
      px={2}          
      py={2}             
      boxSizing="border-box"  
    >
      <HStack gap={1}>
        <IconButton
          aria-label="알림"
          variant="ghost"
          boxSize="35px"
          onClick={handleNotificationClick}
        >
          <HiBell style={{ width: '30px', height: '30px' }} />
        </IconButton>

        {/* 사이드 메뉴 트리거 */}
        <SideMenu containerRef={containerRef} />
      </HStack>

    </Flex>
  );
};

export default AppHeader;
