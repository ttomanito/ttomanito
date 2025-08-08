import type { Message } from '@/types/chat/chat';
import ChatBubble from './ChatBubble';
import SystemMessage from './SystemMessage';

const ChatMessageRenderer = ({ message }: { message: Message }) => {
  switch (message.type) {
    case 'system':
      return <SystemMessage category={message.systemCategory} />;
    case 'poke':
      return <ChatBubble {...message} />;
    default:
      return <ChatBubble {...message} />;
  }
};

export default ChatMessageRenderer;
