import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface ProfileListItemProps {
  name: string;
  statusMessage: string;
  profileImageUrl?: string; // 사용하지 않지만 props 구조 유지
  rightSideChild?: ReactNode;
  borderWidth?: string; // 추가
  borderColor?: string; // 추가
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  name,
  statusMessage,
  rightSideChild,
  borderWidth = "1px", 
  borderColor = "gray.200", 
}) => {
  // 이니셜 추출 
  const initial = name[0];

  return (
    <Flex 
      bg="gray.50" 
      p={3} 
      borderRadius="md" 
      align="center" 
      gap={4} 
      w="full"
      borderWidth={borderWidth}    // 추가
      borderColor={borderColor}    // 추가
    >

      {/* Avatar 대신 Box로 원형 프로필 구현 */}
      <Box
        w="32px"
        h="32px"
        bg="blue.100"
        color="blue.800"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight="bold"
        fontSize="sm"
        flexShrink={0}
      >
        {initial}
      </Box>

      <Box>
        <Text textStyle="body_sm">{name}</Text>
        <Text textStyle="caption_xs_md">{statusMessage}</Text>
      </Box>
      {rightSideChild && <Box marginLeft={'auto'}>{rightSideChild}</Box>}
    </Flex>
  );
};

export default ProfileListItem;
