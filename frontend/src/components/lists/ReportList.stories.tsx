// components/ReportList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import ReportList from './ReportList';

const meta: Meta<typeof ReportList> = {
  title: 'Components/ReportList',
  component: ReportList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ReportList>;

export const Default: Story = {
  args: {
    data: [
      { label: '내 정답 순위', value: '2위' },
      { label: '내가 맞힌 횟수', value: '7회' },
      { label: '나를 찌르기한 횟수', value: '7회' },
      { label: '내가 찌르기한 횟수', value: '7회' },
      { label: '통화 시간', value: '1시간 45분' },
    ],
  },
};
