import type { Meta, StoryObj } from '@storybook/react';
import ProfileCard from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    subtitle: { control: 'text' },
    title: { control: 'text' },
    src: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = {
  args: {
    title: '내 마니또',
    name: '권윤정',
    subtitle: '전 앞머리가 있어요',
    src: 'https://i.pravatar.cc/300?img=5',
  },
};

export const WithoutTitle: Story = {
  args: {
    name: '김민수',
    subtitle: '조용한 관찰자',
    src: 'https://i.pravatar.cc/300?img=7',
  },
};
