import type { Meta, StoryObj } from '@storybook/react-vite';
import ChatBubble from './ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  decorators: [Story => <Story />],
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const ReceivedMessage: Story = {
  args: {
    sender: 'other',
    content: '안녕하세요!\n만나서 반가워요.',
    time: '오후 2:34',
    type: 'text',
  },
};

export const MyMessage: Story = {
  args: {
    sender: 'me',
    content: '안녕하세요! 반가워요 😄',
    time: '오후 2:35',
    type: 'text',
  },
};

export const PokeMessage: Story = {
  args: {
    sender: 'other',
    content: '',
    time: '오후 2:36',
    type: 'poke',
  },
};
