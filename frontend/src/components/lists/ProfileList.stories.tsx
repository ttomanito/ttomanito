import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileList from './ProfileList';

const meta: Meta<typeof ProfileList> = {
  title: 'Components/ProfileList',
  component: ProfileList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileList>;

export const Default: Story = {
  args: {
    data: [
      { name: '안수진', statusMessage: '햄수진' },
      { name: '길태은', statusMessage: '분석 중' },
      { name: '양준하', statusMessage: '턱걸이 중' },
    ],
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
