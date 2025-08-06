import { Box, Text } from '@chakra-ui/react';
interface msgType {
  type: 'exit';
}

const SystemMessage = ({ type }: msgType) => {
  const msgByType = {
    exit: '마니또가 탈퇴하였습니다.',
  };

  return (
    <Box bg="gray.100" textAlign="center" textStyle="body_sm" py={2} my={10}>
      <Text textStyle="caption_xs_light">{msgByType[type]}</Text>
    </Box>
  );
};
export default SystemMessage;
