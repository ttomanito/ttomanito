import type { Meta, StoryObj } from '@storybook/react-vite';
import GuessListItem from './GuessListItem';

const meta: Meta<typeof GuessListItem> = {
  title: 'Components/GuessListItem',
  component: GuessListItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GuessListItem>;

export const Default: Story = {
  args: {
    date: '07.28',
    name: '홍길동',
  },
};

export const AnotherGuess: Story = {
  args: {
    date: '07.27',
    name: '김철수',
  },
};
