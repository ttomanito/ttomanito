// components/MissionList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import MissionList from './MissionList';
import type { Mission } from './MissionList';

const meta: Meta<typeof MissionList> = {
  title: 'Components/MissionList',
  component: MissionList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MissionList>;

const mockMissions: Mission[] = [
  {
    id: 1,
    date: '07.01',
    content: '인사하기',
    completed: true,
  },
  {
    id: 2,
    date: '07.02',
    content: '간식 주기',
    completed: false,
  },
];

export const Default: Story = {
  args: {
    missions: mockMissions,
  },
};

export const Empty: Story = {
  args: {
    missions: [],
  },
};
