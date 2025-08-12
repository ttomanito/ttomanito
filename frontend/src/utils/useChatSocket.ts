// src/utils/useChatSocket.ts
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef, useState } from 'react';

// 1. 백엔드에서 오는 메시지 타입 (필요 시 더 상세하게 정의)
interface ReceivedMessage {
  senderRoomUserId: number;
  sentAt: string;
  content?: string;
}

// 2. 훅의 props 타입: ID들이 null일 수 있음을 명시
interface UseChatSocketProps {
  chatRoomId: string | null;
  myUserId: string | null;
  onMessage: (msg: ReceivedMessage) => void;
}

export const useChatSocket = ({ chatRoomId, myUserId, onMessage }: UseChatSocketProps) => {
  const client = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    // 3. ID가 null이면 연결을 시도하지 않고 종료 (가장 중요한 변경점)
    if (!chatRoomId || !myUserId) {
      return;
    }

    const sock = new SockJS('https://i13b206.p.ssafy.io/ws/chat');
    
    const stompClient = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        setIsConnected(true);
        
        stompClient.subscribe('/user/queue/history', (res: IMessage) => {
            const history = JSON.parse(res.body) as ReceivedMessage[];
            history.forEach(msg => onMessageRef.current(msg));
        });
        stompClient.publish({ destination: `/app/chat.history.${chatRoomId}`, body: '{}' });

        stompClient.subscribe(`/topic/chat.${chatRoomId}`, (res: IMessage) => {
            const msg = JSON.parse(res.body) as ReceivedMessage;
            onMessageRef.current(msg);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      // 4. 연결이 활성화된 상태에서만 deactivate를 호출하도록 안정성 추가
      if (client.current?.active) {
        client.current.deactivate();
      }
    };
  }, [chatRoomId, myUserId]); // ID가 변경되면 useEffect가 다시 실행됨

  const sendMessage = (content: string) => {
    // 5. ID가 null인 경우를 대비해 여기서도 방어 코드 추가
    if (!client.current?.connected || !chatRoomId || !myUserId) return;
    
    const payload = {
      chattingchatRoomId: +chatRoomId,
      senderRoomUserId: +myUserId,
      content,
    };
    client.current.publish({
      destination: `/app/chat.send.${chatRoomId}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const sendPoke = () => {
    if (!client.current?.connected || !chatRoomId || !myUserId) return;

    const payload = {
      chattingchatRoomId: +chatRoomId,
      senderRoomUserId: +myUserId,
    };
    client.current.publish({
      destination: `/app/chat.poke.${chatRoomId}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  return {
    sendMessage,
    sendPoke,
    isConnected,
  };
};