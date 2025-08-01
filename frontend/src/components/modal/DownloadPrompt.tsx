import { Dialog, Portal, createOverlay, Button, VStack, Text } from "@chakra-ui/react"

interface PromptProps {
  title: string
  description?: string
}

let deferredInstallPrompt: any = null;

export const setDeferredPrompt = (prompt: any) => {
  deferredInstallPrompt = prompt;
};

export const downloadPrompt = createOverlay<PromptProps>((props) => {
  const { title, description, ...rest } = props;

  const handleInstall = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();

      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('👍 유저가 설치를 수락했어요!');
      } else {
        console.log('👎 유저가 설치를 취소했어요.');
      }

      deferredInstallPrompt = null;
    } else {
      window.open("https://your-app-download-link.com", "_blank");
    }
  };

  return (
    <Dialog.Root {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4}>
                {description && (
                  <Text textAlign="center">{description}</Text>
                )}
                <Button colorScheme="blue" w="full" onClick={handleInstall}>
                  앱 다운로드
                </Button>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});
