import type { Meta, StoryObj } from '@storybook/react-vite';
import LongButton from './LongButton';

const meta: Meta<typeof LongButton> = {
  title: 'Components/LongButton',
  component: LongButton,
  tags: ['autodocs'],
  args: {
    children: '확인',
  },
};

export default meta;
type Story = StoryObj<typeof LongButton>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingText: '로딩 중...',
  },
};

export const CustomText: Story = {
  args: {
    children: '제출하기',
  },
};
