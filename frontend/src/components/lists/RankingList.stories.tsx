import type { Meta, StoryObj } from '@storybook/react-vite';
import RankingList from './RankingList';

const meta: Meta<typeof RankingList> = {
  title: 'Components/RankingList',
  component: RankingList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RankingList>;

export const Default: Story = {
  args: {
    data: [
      { rank: 1, name: '안수진', statusMessage: '맵', score: 7 },
      { rank: 2, name: '길태은', statusMessage: '길쉐프', score: 6 },
      { rank: 3, name: '이지혜', statusMessage: '테니스팡', score: 5 },
      { rank: 4, name: '우지연', statusMessage: '안녕하세요', score: 4 },
      { rank: 5, name: '양준하', statusMessage: '정준하 아니고 양준하', score: 3 },
    ],
  },
};
