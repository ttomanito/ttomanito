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
