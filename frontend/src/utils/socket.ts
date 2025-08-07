// src/utils/stomp.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const connectStomp = (roomId: number, userId: number, onMessage: (msg: any) => void) => {
  const socketUrl = 'https://i13b206.p.ssafy.io/ws';
  const accessToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiLshozquIgiLCJpYXQiOjE3NTQ0NzAwMzcsImV4cCI6MTc1NDQ3MDkzN30.lWlT5TnEHMl7xsyLxKfO8Lx4O6Ln7mt3-cCN5h8u9ag';
  const client = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`, // ✅ 여기!
      roomId: String(roomId),
      userId: String(userId),
    },

    reconnectDelay: 5000,
    debug: str => console.log('[STOMP DEBUG]', str),
    onConnect: () => {
      console.log('[STOMP] Connected ✅');

      client.subscribe(`/topic/waiting/${roomId}`, message => {
        const body = JSON.parse(message.body);
        console.log('[STOMP] Message:', body);
        onMessage(body);
      });
    },
    onStompError: frame => {
      console.error('[STOMP] Error:', frame);
    },
  });

  client.activate();
  return client;
};
