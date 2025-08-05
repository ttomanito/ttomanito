import {
  Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  CloseButton,
  Text,
} from "@chakra-ui/react"
import type { ReactNode } from "react"
import LongButton from "../buttons/LongButton"

interface BaseModalProps {
  open: boolean
  onClose: () => void
  title?: string
  caption?: string
  body?: ReactNode
  footer?: ReactNode
}
const BaseModal = ({ open, onClose, title, caption, body, footer }: BaseModalProps) => {
  if (!open) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop
        bg="blackAlpha.600"
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex="overlay"
        onClick={onClose}
      />
        <DialogPositioner
          maxW="480px"
          position="absolute"  // fixed 대신 absolute 사용
          top="60%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex="modal"
        >
        <DialogContent rounded="xl" mx="2" px="6">
          <DialogHeader flexDir="column" textAlign="center" w="full">
            <DialogTitle textStyle="modal_title" textAlign="center" w="full">
              {title ?? "제목 없음"}
            </DialogTitle>
            {caption && (
              <Text textStyle="caption_xs_light">{caption}</Text>
            )}
          </DialogHeader>
          <DialogBody>{body ?? <p>내용 없음</p>}</DialogBody>
          <DialogFooter>
            {footer ?? <LongButton onClick={onClose}>확인</LongButton>}
          </DialogFooter>
          <DialogCloseTrigger asChild>
            <CloseButton size="sm" />
          </DialogCloseTrigger>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
};


export default BaseModal
