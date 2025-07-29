import type { Meta, StoryObj } from '@storybook/react-vite';
import DoubleButton from './DoubleButton';

const meta: Meta<typeof DoubleButton> = {
  title: 'Components/DoubleButton',
  component: DoubleButton,
  tags: ['autodocs'],
  args: {
    leftLabel: '초대하기',
    rightLabel: '참여하기',
  },
};

export default meta;
type Story = StoryObj<typeof DoubleButton>;

export const Default: Story = {
  args: {
    onLeftClick: () => alert('초대하기 눌림'),
    onRightClick: () => alert('참여하기 눌림'),
  },
};

export const LeftDisabled: Story = {
  args: {
    onLeftClick: () => {},
    onRightClick: () => {},
    leftProps: {
      disabled: true,
    },
  },
};

export const RightLoading: Story = {
  args: {
    onLeftClick: () => {},
    onRightClick: () => {},
    rightProps: {
      loading: true,
      loadingText: '진행 중...',
    },
  },
};

export const CustomSpacing: Story = {
  args: {
    onLeftClick: () => {},
    onRightClick: () => {},
    mt: 10,
    px: 4,
  },
};
