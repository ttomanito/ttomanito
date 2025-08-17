import type { Meta, StoryObj } from '@storybook/react-vite';
import MissionListItem from './MissionListItem';

const meta: Meta<typeof MissionListItem> = {
  title: 'Components/MissionListItem',
  component: MissionListItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MissionListItem>;

export const Completed: Story = {
  args: {
    date: '07.01',
    content: '인사하기',
    completed: true,
  },
};

export const NotCompleted: Story = {
  args: {
    date: '07.02',
    content: '간식 주기',
    completed: false,
  },
};
