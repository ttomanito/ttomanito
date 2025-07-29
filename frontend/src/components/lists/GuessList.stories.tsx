import type { Meta, StoryObj } from '@storybook/react-vite';
import GuessHistoryList from './GuessList';

const meta: Meta<typeof GuessHistoryList> = {
  title: 'Components/GuessHistoryList',
  component: GuessHistoryList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GuessHistoryList>;

export const Default: Story = {
  args: {
    guesses: [
      { id: 1, date: '07.27', name: '홍길동' },
      { id: 2, date: '07.28', name: '김철수' },
      { id: 3, date: '07.29', name: '이영희' },
    ],
  },
};

export const Empty: Story = {
  args: {
    guesses: [],
  },
};
