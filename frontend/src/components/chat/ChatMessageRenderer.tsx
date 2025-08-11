// src/components/chat/ChatMessageRenderer.tsx

import type { Message } from '@/types/chat/chat';
import ChatBubble from './ChatBubble';
import SystemMessage from './SystemMessage';

// 👇 props 타입 정의에 myUserId: string 을 추가합니다.
interface ChatMessageRendererProps {
  message: Message;
  myUserId: string;
}

const ChatMessageRenderer = ({ message, myUserId }: ChatMessageRendererProps) => {
  switch (message.type) {
    case 'system':
      return <SystemMessage category={message.systemCategory} />;
    case 'poke':
      // 👇 ChatBubble로 myUserId를 전달합니다.
      return <ChatBubble message={message} myUserId={myUserId} />;
    default:
      // 👇 여기에도 myUserId를 전달합니다.
      return <ChatBubble message={message} myUserId={myUserId} />;
  }
};

export default ChatMessageRenderer;