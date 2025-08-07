import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  CloseButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import InstallBanner from './InstallBanner'; // 문서 자동화를 위한 실제 컴포넌트 연결

const meta: Meta<typeof InstallBanner> = {
  title: 'UI/InstallBanner',
  component: InstallBanner,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof InstallBanner>;

export const Default: Story = {
  render: () => <InstallBannerMock />,
};

// ✅ Storybook 전용 Mock 컴포넌트 (왼쪽 닫기 / 오른쪽 설치 버튼 스타일 반영)
const InstallBannerMock = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100%"
      bg="accent.500"
      color="white"
      py={3}
      px={4}
      zIndex="overlay"
      display= "flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* 왼쪽 닫기 버튼 */}
      <CloseButton
        aria-label="닫기"
        size="md"
        variant="ghost"
        color="whiteAlpha.800"
        _hover={{ color: 'white' }}
        onClick={() => setVisible(false)}
      />

      {/* 가운데 텍스트 */}
      <VStack align="start" gap={0} flex="1" ml={4} mr={4}>
        <Text fontWeight="bold" fontSize="md">
          또마니또
        </Text>
        <Text fontSize="sm" color="whiteAlpha.900">
          앱을 설치하고 더 편하게 즐겨보세요!
        </Text>
      </VStack>

      {/* 오른쪽 설치 버튼 */}
      <Button
        bg="white"
        color="purple.700"
        size="sm"
        borderRadius="full"
        onClick={() => alert('Install Clicked!')}
        px={4}
        fontWeight="bold"
      >
        설치
      </Button>
    </Box>
  );
};
