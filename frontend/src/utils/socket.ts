// src/utils/stomp.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// utils/stomp.ts
export const connectStomp = ({
  accessToken,
  roomId,
  // userId,
  onMessage,
}: {
  accessToken: string;
  roomId: number;
  // userId: number;
  onMessage: (msg: any) => void;
}) => {
  const socketUrl = 'https://i13b206.p.ssafy.io/ws/waiting';
  const client = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    connectHeaders: {
      Authorization: `Bearer 토큰`, // Bearer 뒤에 토큰 넣어주세요
    },
    // connectHeaders: { Authorization: `Bearer ${accessToken}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: str => console.log('[STOMP DEBUG]', str),
    onConnect: () => {
      console.log('[STOMP] Connected ✅');
      const topic = `/topic/waiting/6`; // [todo] roomId 변수로 수정 필요
      // const topic = `/topic/waiting/${roomId}`;
      console.log('[STOMP] SUBSCRIBE ->', topic);
      client.subscribe(topic, message => {
        try {
          onMessage(JSON.parse(message.body));
        } catch {
          onMessage(message.body);
        }
      });
    },
    onStompError: frame => console.error('[STOMP] Error:', frame),
  });

  client.activate();
  return client;
};
