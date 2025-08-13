import type { Meta, StoryObj } from '@storybook/react-vite';
import SystemMessage from './SystemMessage';

const meta: Meta<typeof SystemMessage> = {
  title: 'Components/SystemMessage',
  component: SystemMessage,
};

export default meta;

type Story = StoryObj<typeof SystemMessage>;

export const ExitMessage: Story = {
  args: {
    category: 'exit',
  },
};
