import { Box, Flex, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function BackBar() {
  const nav = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      nav(-1); // 히스토리 있으면 이전 페이지로
    } else {
      nav('/'); // 히스토리 없으면 메인 페이지로
    }
  };

  return (
    <Box
      as="header"
      bg="white"
      borderColor="gray.100"
    >
      <Flex h="48px" align="center" px={2} gap={2}>
        <Button
          textStyle="caption_xs_md"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          fontSize="sm"
          px={2}
        >
          ← 뒤로가기
        </Button>
      </Flex>
    </Box>
  );
}
