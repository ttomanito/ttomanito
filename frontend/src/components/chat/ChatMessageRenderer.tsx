// src/components/chat/ChatMessageRenderer.tsx - 통화 기능 지원

import type { Message } from '@/types/chat/chat';
import ChatBubble from './ChatBubble';
import SystemMessage from './SystemMessage';

interface ChatMessageRendererProps {
  message: Message;
  myUserId: string;
  onCallAccept?: () => void;
  onCallReject?: () => void;
}

const ChatMessageRenderer = ({ 
  message, 
  myUserId, 
  onCallAccept, 
  onCallReject 
}: ChatMessageRendererProps) => {
  switch (message.type) {
    case 'system':
      return <SystemMessage category={message.systemCategory || 'exit'} />;
    
    case 'poke':
    case 'text':
    case 'call_start':
    case 'call_accept':
    case 'call_reject':
      return (
        <ChatBubble 
          message={message} 
          myUserId={myUserId}
          onCallAccept={onCallAccept}
          onCallReject={onCallReject}
        />
      );
    
    default:
      return (
        <ChatBubble 
          message={message} 
          myUserId={myUserId}
          onCallAccept={onCallAccept}
          onCallReject={onCallReject}
        />
      );
  }
};

export default ChatMessageRenderer;