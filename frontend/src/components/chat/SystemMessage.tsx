import { Box, Text } from '@chakra-ui/react';
interface msgType {
  category: 'exit';
}

const SystemMessage = ({ category }: msgType) => {
  const msgByCategory = {
    exit: '마니또가 탈퇴하였습니다.',
  };

  return (
    <Box bg="gray.100" textAlign="center" textStyle="body_sm" py={2} my={10}>
      <Text textStyle="caption_xs_light">{msgByCategory[category]}</Text>
    </Box>
  );
};
export default SystemMessage;
