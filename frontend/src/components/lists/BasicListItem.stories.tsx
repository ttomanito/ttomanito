// components/BasicListItem.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";
import BasicListItem from "./BasicListItem";

// ChakraProvider 없이 작성
const meta: Meta<typeof BasicListItem> = {
  title: "Components/BasicListItem",
  component: BasicListItem,
  tags: ["autodocs"],
  argTypes: {
    date: { control: "text" },
    content: { control: "text" },
    py: { control: "text" },
    px: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof BasicListItem>;

export const Default: Story = {
  args: {
    date: "07.21",
    content: "마니또가 탈퇴했어요",
  },
};

export const LongContent: Story = {
  args: {
    date: "07.21",
    content: "이 메시지는 길게 작성되어서 텍스트가 줄 바꿈되거나 break-all 스타일이 적용되는지 확인하기 위한 예시입니다.",
  },
};

export const CustomPadding: Story = {
  args: {
    date: "08.01",
    content: "패딩이 다르게 적용된 리스트 아이템",
    py: 4,
    px: 6,
  },
};
