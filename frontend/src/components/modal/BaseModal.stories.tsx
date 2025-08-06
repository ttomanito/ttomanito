/**
 * @file BaseModal.tsx
 * @description 앱 전체에서 사용되는 기본 모달의 UI를 정의합니다.
 * @module components/modal/BaseModal
 *
 * @property {boolean} open - 모달의 열림 상태를 나타냅니다.
 * @property {() => void} onClose - 모달을 닫을 때 호출될 함수입니다.
 * @property {string} [title] - 모달의 제목입니다. 이 prop이 없으면 헤더 전체가 렌더링되지 않습니다.
 * @property {string} [caption] - 제목 아래에 표시될 작은 캡션 텍스트입니다.
 * @property {ReactNode} [body] - 모달의 주된 내용(콘텐츠)입니다. React 컴포넌트를 포함한 모든 `ReactNode`가 가능합니다.
 * @property {ReactNode} [footer] - 모달의 푸터(하단 버튼 영역)입니다. 이 prop이 없으면 기본 '닫기' 버튼이 표시됩니다.
 *
 * @see useModalStore - 이 모달은 `useModalStore`라는 전역 Zustand 스토어를 통해 제어됩니다.
 *
 * @example
 *  이 컴포넌트는 `AppLayout` 즉 최상위 컴포넌트에서 한 번만 렌더링하고,
 *  다른 하위 컴포넌트에서 스토어의 `openModal` 액션을 호출하여 사용합니다.
 *
 * 
 * - 사용하려는 컴포넌트 속에서 선언 (AnyComponent.tsx)
 * 
 * 
 * 1. 스토어에서 모달 스토어 불러오기
 * 
 *    import { useModalStore } from '@/stores/modalStore';
 *    // 만약 바디 내용을 컴포넌트화 했다면 불러와서 넣기 가능
 *    import TutorialBody from './TutorialBody';
 *
 * 
 * 2. 객체로 모달스토어에서 openModal, closeModal 함수 가져오기 // closeModal은 선택 사항이라 안 써도 됩니다
 * 
 *   const MyComponent = () => { 
 *      const { openModal, closeModal } = useModalStore();
 *
 * 
 * 3. openModal 안에 모달 내용 쓰기.
 *    title, caption, body는 없으면 비웁니다
 *    footer는 없으면 기본 '닫기' 롱버튼이 표시됩니다.
 * 
 *   const handleOpenSimpleModal = () => {
 *     openModal({
 *       title: '간단한 알림',
 *       caption: '이것은 캡션입니다.',
 *       body: <Text>모달 내용입니다.</Text>,
 *       footer: <LongButton onClick={closeModal}>닫기</LongButton>
 *     });
 *   };
 * 
 * 4. 원하는 곳에서 onClick 이벤트로 openModal 호출
 * 
 *   return (
 *     <>
 *       <Button onClick={handleOpenSimpleModal}>기본 모달</Button>
 *       <Button onClick={handleOpenCustomFooterModal}>커스텀 푸터 모달</Button>
 *       <Button onClick={handleOpenTutorial}>튜토리얼 모달</Button>
 *     </>
 *   )
 * }
 */

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import BaseModal from "./BaseModal"

const meta: Meta<typeof BaseModal> = {
  title: "Components/BaseModal",
  component: BaseModal,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof BaseModal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <BaseModal
        open={open}
        onClose={() => setOpen(false)}
        title="기본 모달"
        caption="이것은 기본 모달의 본문입니다."
      />
    )
  },
}
