import type { Meta, StoryObj } from '@storybook/react-vite';
import RankingListItem from './RankingListItem';

const meta: Meta<typeof RankingListItem> = {
  title: 'Components/RankingListItem',
  component: RankingListItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RankingListItem>;

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

export const OtherRank: Story = {
  args: {
    rank: 5,
    name: '양준하',
    statusMessage: '정준하 아니고 양준하',
    score: 3,
  },
};
