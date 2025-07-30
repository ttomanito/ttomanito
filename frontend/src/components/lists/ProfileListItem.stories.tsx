import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileListItem from './ProfileListItem';

const meta: Meta<typeof ProfileListItem> = {
  title: 'Components/ProfileListItem',
  component: ProfileListItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileListItem>;

export const Default: Story = {
  args: {
    name: '안수진',
    statusMessage: '햄수진',
  },
};

export const LongName: Story = {
  args: {
    name: '김민수김민수김민수',
    statusMessage: '열심히 하는 중',
  },
};

export const NoStatusMessage: Story = {
  args: {
    name: '이영희',
    statusMessage: '',
  },
};
