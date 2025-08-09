// components/CommonCard.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";
import CommonCard from "./CommonCard";
import { Text, VStack } from "@chakra-ui/react";
import TextInput from "../inputs/TextInput";

const meta: Meta<typeof CommonCard> = {
  title: "Components/CommonCard",
  component: CommonCard,
  tags: ["autodocs"],
  argTypes: {
    p: { control: "number", description: "padding" },
    maxW: { control: "text", description: "max width" },
    children: { control: false }, // children은 직접 코드에서 렌더링하도록
  },
};

export default meta;
type Story = StoryObj<typeof CommonCard>;

export const Default: Story = {
  args: {
    children: (
      <Text textStyle="title_sm">카드 내 기본 텍스트를 보여주는 예시입니다.</Text>
    ),
  },
};

export const WithHeaderAndInput: Story = {
  args: {
    children: (
      <VStack align="stretch">
        <Text textStyle="title_md" fontWeight="bold">제목</Text>
        <Text textStyle="title_sm">설명이나 본문 영역입니다.</Text>
        <TextInput value="" onChange={() => {}} placeholder="내용을 입력하세요" />


      </VStack>
    ),
  },
};


export const CustomMaxWidth: Story = {
  args: {
    maxW: "400px",
    children: (
      <Text textStyle="title_sm">이 카드는 최대 너비 400px로 제한됩니다.</Text>
    ),
  },
};
