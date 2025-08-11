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
    message: {
      id: 'msg-1',
      sender: 'other-user-id',
      content: '안녕하세요!\n만나서 반가워요.',
      time: '오후 2:34',
      type: 'text',
    },
    myUserId: 'my-user-id',
  },
};

export const MyMessage: Story = {
  args: {
    message: {
      id: 'msg-2',
      sender: 'my-user-id',
      content: '안녕하세요! 반가워요 😄',
      time: '오후 2:35',
      type: 'text',
    },
    myUserId: 'my-user-id',
  },
};

export const PokeMessage: Story = {
  args: {
    message: {
      id: 'msg-3',
      sender: 'other-user-id',
      content: '',
      time: '오후 2:36',
      type: 'poke',
    },
    myUserId: 'my-user-id',
  },
};

export const MyPokeMessage: Story = {
  args: {
    message: {
      id: 'msg-4',
      sender: 'my-user-id',
      content: '',
      time: '오후 2:37',
      type: 'poke',
    },
    myUserId: 'my-user-id',
  },
};

export const LongMessage: Story = {
  args: {
    message: {
      id: 'msg-5',
      sender: 'other-user-id',
      content: '이것은 아주 긴 메시지입니다. 여러 줄에 걸쳐서 작성된 메시지이고, 채팅 버블이 어떻게 표시되는지 확인하기 위한 테스트 메시지입니다.\n\n줄바꿈도 포함되어 있어요!',
      time: '오후 2:38',
      type: 'text',
    },
    myUserId: 'my-user-id',
  },
};

export const MyLongMessage: Story = {
  args: {
    message: {
      id: 'msg-6',
      sender: 'my-user-id',
      content: '내가 보내는 긴 메시지입니다. 내 메시지는 오른쪽에 정렬되고 accent 색상으로 표시됩니다.\n\n여러 줄로 작성된 메시지가 어떻게 보이는지 확인해보세요!',
      time: '오후 2:39',
      type: 'text',
    },
    myUserId: 'my-user-id',
  },
};