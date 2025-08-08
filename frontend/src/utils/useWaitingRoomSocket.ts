// src/hooks/useWaitingRoomSocket.ts

import { useState, useRef, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';

// 참가자 정보에 대한 타입 정의
export interface Participant {
  userId: number | string;
  statusMessage?: string;
  // 필요에 따라 닉네임, 프로필 이미지 등 추가 가능
}

// 서버와 주고받을 메시지 타입 정의
export type MessageType = 'ENTER' | 'EXIT' | 'CLOSE' | 'START' | 'KICK';

// 서버로 메시지를 보낼 때 사용할 데이터 형식
export interface MessagePayload {
  roomId: number | string;
  userId: number | string;
  [key: string]: any; // statusMessage, targetUserId 등 추가 속성 허용
}

/**
 * 대기실 웹소켓 관리를 위한 React Custom Hook
 */
export const useWaitingRoomSocket = () => {
  // --- 상태 (State) ---
  const stompClient = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // --- 내부 로직 (Private Logic) ---
  
  /**
   * 서버로부터 메시지를 수신했을 때의 콜백 함수
   */
  const onMessageReceived = useCallback((message: IMessage) => {
    try {
      const body = JSON.parse(message.body);
      setLastMessage(body); // 마지막 메시지 업데이트

      console.log('메시지 수신:', body);

      // 메시지 타입에 따라 참가자 목록 상태 변경
      switch (body.type as MessageType) {
        case 'ENTER':
          setParticipants(prev => {
            const existingIndex = prev.findIndex(p => p.userId === body.userId);
            if (existingIndex > -1) {
              // 정보 업데이트
              const newParticipants = [...prev];
              newParticipants[existingIndex] = { ...newParticipants[existingIndex], ...body };
              return newParticipants;
            } else {
              // 새로 추가
              return [...prev, { userId: body.userId, statusMessage: body.statusMessage }];
            }
          });
          break;

        case 'EXIT':
        case 'KICK':
          setParticipants(prev => prev.filter(p => p.userId !== body.userId));
          break;

        case 'START':
          console.log('게임이 시작되었습니다!');
          // 여기에 게임 시작 관련 로직 (e.g., navigate('/game'))
          break;

        case 'CLOSE':
          console.log('방이 닫혔습니다.');
          // 연결 종료 로직은 disconnect 함수에서 처리
          break;
      }
    } catch (error) {
      console.error('메시지 처리 중 오류 발생:', error);
    }
  }, []);

  // --- 외부 노출 메소드 (Public Methods) ---

  /**
   * 웹소켓 연결을 시작합니다.
   */
  const connect = useCallback((roomId: number | string, initialParticipants: Participant[] = []) => {
    if (stompClient.current?.active) {
      console.warn('이미 웹소켓에 연결되어 있습니다.');
      return;
    }

    setParticipants(initialParticipants);
    
    const client = new Client({
      brokerURL: 'wss://i13b206.p.ssafy.io/ws/waiting', // wss 사용 권장
      webSocketFactory: () => new SockJS('https://i13b206.p.ssafy.io/ws/waiting'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        console.log('✅ 웹소켓 연결 성공');

        // 방 주제(topic) 구독
        client.subscribe(`/topic/waiting/${roomId}`, onMessageReceived);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setConnected(false);
      },
    });

    client.activate();
    stompClient.current = client;

  }, [onMessageReceived]);

  /**
   * 웹소켓 연결을 종료합니다.
   */
  const disconnect = useCallback(() => {
    if (stompClient.current?.active) {
      stompClient.current.deactivate();
    }
    setConnected(false);
    setParticipants([]);
    console.log('🔌 웹소켓 연결이 종료되었습니다.');
  }, []);

  /**
   * 서버로 메시지를 전송합니다.
   */
  const sendMessage = useCallback((type: MessageType, payload: MessagePayload) => {
    if (!stompClient.current?.active) {
      console.error('웹소켓이 연결되지 않아 메시지를 보낼 수 없습니다.');
      return;
    }

    const destination = '/app/waiting/message';
    stompClient.current.publish({
      destination,
      body: JSON.stringify({ type, ...payload }),
    });
  }, []);

  // 컴포넌트 언마운트 시 자동으로 연결 종료
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    participants,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
};