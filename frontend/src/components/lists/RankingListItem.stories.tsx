import type { Meta, StoryObj } from '@storybook/react-vite';
import RankingItem from './RankingListItem';

const meta: Meta<typeof RankingItem> = {
  title: 'Components/RankingItem',
  component: RankingItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RankingItem>;

export const FirstPlace: Story = {
  args: {
    rank: 1,
    name: '안수진',
    statusMessage: '햄수진',
    score: 7,
  },
};

export const SecondPlace: Story = {
  args: {
    rank: 2,
    name: '길태은',
    statusMessage: '길쉐프',
    score: 6,
  },
};

export const ThirdPlace: Story = {
  args: {
    rank: 3,
    name: '안수진',
    statusMessage: '맵',
    score: 7,
  },
};

export const OtherRank: Story = {
  args: {
    rank: 5,
    name: '안수진',
    statusMessage: '햄',
    score: 7,
  },
};
