// components/ReportListItem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import ReportListItem from './ReportListItem';

const meta: Meta<typeof ReportListItem> = {
  title: 'Components/ReportListItem',
  component: ReportListItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ReportListItem>;

export const Default: Story = {
  args: {
    label: '내 정답 순위',
    value: '2위',
  },
};

export const LongLabel: Story = {
  args: {
    label: '정답률이 가장 높은 문제 유형',
    value: '객관식 5번 문제',
  },
};

export const NumberOnly: Story = {
  args: {
    label: '나를 찌르기한 횟수',
    value: '7',
  },
};
