import type { Meta, StoryObj } from '@storybook/react-vite';
import LongButton from './LongButton';

const meta: Meta<typeof LongButton> = {
  title: 'UI/LongButton', // Storybook 좌측 탐색 트리에 표시될 이름
  component: LongButton,
  tags: ['autodocs'], // 자동 문서화를 위한 태그
  argTypes: {
    onClick: { action: 'clicked' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof LongButton>;

export const Default: Story = {
  args: {
    children: '기본 버튼',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화된 버튼',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: '로딩 중...',
    loading: true,
  },
};
