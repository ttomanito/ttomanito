import {
  Box,
  VStack,
  Text,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      w="100%"
      bg="accent.100"
      color="blackAlpha.900"
      py={3}
      px={4}
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* 왼쪽 닫기 버튼 */}
      <CloseButton
        aria-label="닫기"
        size="md"
        variant="ghost"
        _hover={{ color: 'gray.500' }}
        onClick={handleCloseClick}
      />

      {/* 가운데 텍스트 */}
      <VStack align="start" gap={0} flex="1" ml={4} mr={4}>
        <Text fontWeight="bold" fontSize="md">
          또마니또
        </Text>
        <Text fontSize="sm">
          앱을 설치하고 더 편하게 즐겨보세요!
        </Text>
      </VStack>

      {/* 오른쪽 설치 버튼 */}
      <Button
        bg="white"
        color="gray.900"
        size="sm"
        borderRadius="full"
        onClick={handleInstallClick}
        px={4}
        fontWeight="bold"
      >
        설치
      </Button>
    </Box>
  );
};

export default InstallBanner;
