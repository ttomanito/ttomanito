
import { Box, Flex, Text } from '@chakra-ui/react';

interface ProfileListItemProps {
  name: string;
  statusMessage: string;
  profileImageUrl?: string; // 사용하지 않지만 props 구조 유지
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  name,
  statusMessage,
}) => {
  // 이니셜 추출 (예: 안수진 → 안)
  const initial = name[0];

  return (
    <Flex bg="gray.50" p={3} borderRadius="md" align="center" gap={4} w="full">
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
        <Text textStyle="body_sm">
          {name}
        </Text>
        <Text textStyle="caption_xs_md">
          {statusMessage}
        </Text>
      </Box>
    </Flex>
  );
};

export default ProfileListItem;
