// src/utils/useChatSocket.ts - roomUserId로 명확히 수정

import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef, useState, useCallback } from 'react';

// 백엔드 ChatMessageDto와 정확히 일치하는 타입
interface ReceivedMessage {
  chattingRoomId: number;
  senderRoomUserId: number;
  senderUserId: number;
  content: string | null;
  type: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
  sentAt: string; // LocalDateTime → string (ISO format)
}

// 백엔드 HistoryRequest와 일치
interface HistoryRequest {
  before?: string; // LocalDateTime 문자열 또는 undefined
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

interface UseChatSocketProps {
  chatRoomId: string | null;
  roomUserId: string | null; // 👈 명확하게 roomUserId로 변경
  onMessage: (msg: ReceivedMessage) => void;
  onHistoryLoaded?: (messages: ReceivedMessage[], hasMore: boolean) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export const useChatSocket = ({ 
  chatRoomId, 
  roomUserId, // 👈 명확하게 roomUserId로 변경
  onMessage,
  onHistoryLoaded,
  onConnectionStateChange 
}: UseChatSocketProps) => {
  const client = useRef<Client | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const maxReconnectAttempts = 5;
  const HISTORY_PAGE_SIZE = 50; // 백엔드에서 50개씩 가져옴
  
  // 메시지 중복 방지 - senderRoomUserId + sentAt 조합으로 고유성 보장
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  const updateConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    onConnectionStateChange?.(state);
  }, [onConnectionStateChange]);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const onHistoryLoadedRef = useRef(onHistoryLoaded);
  onHistoryLoadedRef.current = onHistoryLoaded;

  // 메시지 중복 체크 및 처리
  const handleMessage = useCallback((msg: ReceivedMessage) => {
    // 백엔드 응답 구조에 맞는 고유 ID 생성
    const messageId = `${msg.senderRoomUserId}-${msg.sentAt}`;
    
    if (processedMessageIds.current.has(messageId)) {
      console.log('[CHAT] 중복 메시지 무시:', messageId);
      return;
    }
    
    processedMessageIds.current.add(messageId);
    onMessageRef.current(msg);
    
    // 메모리 관리 - 최근 200개 메시지 ID만 유지
    if (processedMessageIds.current.size > 200) {
      const messageIds = Array.from(processedMessageIds.current);
      const recentIds = messageIds.slice(-100);
      processedMessageIds.current = new Set(recentIds);
    }
  }, []);

  useEffect(() => {
    if (!chatRoomId || !roomUserId) { // 👈 roomUserId로 변경
      updateConnectionState('disconnected');
      return;
    }

    updateConnectionState('connecting');
    
    if (client.current?.active) {
      client.current.deactivate();
    }

    // 새 채팅방 진입시 메시지 ID 캐시 초기화
    processedMessageIds.current.clear();

    const sock = new SockJS('https://i13b206.p.ssafy.io/ws/chat');
    
    const stompClient = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        // httpOnly 쿠키 + 추가 헤더로 사용자 정보 전달
        'X-User-Id': roomUserId,           // 👈 사용자 ID 헤더 추가
        'X-Chat-Room-Id': chatRoomId,      // 👈 채팅방 ID 헤더 추가
      },
      reconnectDelay: Math.min(5000 * Math.pow(2, reconnectAttempts), 30000),
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        console.log('[CHAT] 웹소켓 연결 성공, roomUserId:', roomUserId);
        updateConnectionState('connected');
        setReconnectAttempts(0);
        
        try {
          // 히스토리 구독 - /topic/history.{chatRoomId}로 변경
          stompClient.subscribe(`/topic/history.${chatRoomId}`, (res: IMessage) => {
            try {
              console.log('[CHAT] 🎯 히스토리 응답 받음!');
              console.log('[CHAT] 응답 headers:', res.headers);
              console.log('[CHAT] 응답 body (raw):', res.body);
              
              const history = JSON.parse(res.body) as ReceivedMessage[];
              console.log('[CHAT] 파싱된 히스토리:', history);
              console.log('[CHAT] 히스토리 수신:', history.length, '개 메시지');
              
              // ✅ 히스토리는 중복 체크 없이 ID만 등록 (실시간 메시지와 구분)
              history.forEach(msg => {
                const messageId = `${msg.senderRoomUserId}-${msg.sentAt}`;
                processedMessageIds.current.add(messageId);
              });
              
              const hasMore = history.length >= HISTORY_PAGE_SIZE;
              // ✅ 히스토리는 별도 콜백으로 처리 (실시간 메시지 핸들러 거치지 않음)
              onHistoryLoadedRef.current?.(history, hasMore);
              setIsLoadingHistory(false);
            } catch (error) {
              console.error('[CHAT] ❌ 히스토리 파싱 오류:', error);
              console.error('[CHAT] 원본 응답:', res.body);
              setIsLoadingHistory(false);
            }
          });

          // 실시간 메시지 구독
          stompClient.subscribe(`/topic/chat.${chatRoomId}`, (res: IMessage) => {
            try {
              console.log('[CHAT] 🔥 실시간 메시지 받음!');
              console.log('[CHAT] 메시지 headers:', res.headers);
              console.log('[CHAT] 메시지 body (raw):', res.body);
              
              const msg = JSON.parse(res.body) as ReceivedMessage;
              console.log('[CHAT] 파싱된 실시간 메시지:', msg);
              handleMessage(msg);
            } catch (error) {
              console.error('[CHAT] ❌ 실시간 메시지 파싱 오류:', error);
              console.error('[CHAT] 원본 응답:', res.body);
            }
          });
          
          // ✅ 연결 완료 후 바로 히스토리 요청 (stompClient 직접 사용)
          console.log('[CHAT] 🚀 초기 히스토리 요청 시작...');
          setIsLoadingHistory(true);
          
          stompClient.publish({
            destination: `/app/chat.history.${chatRoomId}`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
          });
          
        } catch (error) {
          console.error('[CHAT] 구독 설정 오류:', error);
          updateConnectionState('failed');
        }
      },

      onDisconnect: () => {
        console.log('[CHAT] 웹소켓 연결 해제');
        updateConnectionState('disconnected');
      },

      onStompError: (frame) => {
        console.error('[CHAT] STOMP 오류:', frame.headers['message'], frame.body);
        updateConnectionState('failed');
      },

      onWebSocketError: (error) => {
        console.error('[CHAT] 웹소켓 오류:', error);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          updateConnectionState('reconnecting');
          setReconnectAttempts(prev => prev + 1);
        } else {
          updateConnectionState('failed');
          console.error('[CHAT] 최대 재연결 횟수 초과');
        }
      }
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      if (client.current?.active) {
        console.log('[CHAT] 웹소켓 연결 종료');
        client.current.deactivate();
      }
    };
  }, [chatRoomId, roomUserId, handleMessage, updateConnectionState, reconnectAttempts]); // 👈 roomUserId로 변경

  // 히스토리 로드 (페이징 지원)
  const loadHistory = useCallback((beforeDateTime?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!client.current?.connected || !chatRoomId || isLoadingHistory) {
        console.warn('[CHAT] 히스토리 로드 실패: 연결되지 않음 또는 로딩 중');
        resolve(false);
        return;
      }

      try {
        setIsLoadingHistory(true);
        
        // 백엔드 HistoryRequest 구조에 맞게 요청
        const historyRequest: HistoryRequest = beforeDateTime 
          ? { before: beforeDateTime }
          : {}; // 초기 로드시에는 빈 객체 (최신 50개)

        console.log('[CHAT] 히스토리 요청:', historyRequest);
        
        client.current.publish({
          destination: `/app/chat.history.${chatRoomId}`,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(historyRequest),
        });
        
        resolve(true);
      } catch (error) {
        console.error('[CHAT] 히스토리 로드 오류:', error);
        setIsLoadingHistory(false);
        resolve(false);
      }
    });
  }, [chatRoomId, roomUserId, isLoadingHistory]);

  // 이전 메시지 더 로드하기 (무한 스크롤용)
  const loadMoreHistory = useCallback((oldestMessageDateTime: string) => {
    return loadHistory(oldestMessageDateTime);
  }, [loadHistory]);

  // 텍스트 메시지 전송
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) { // 👈 roomUserId로 변경
      console.warn('[CHAT] 메시지 전송 실패: 연결되지 않음');
      return false;
    }
    
    try {
      // 백엔드 ChatMessageDto payload 구조에 맞게
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId, // 👈 roomUserId로 변경
        content,
      };
      
      console.log('[CHAT] 메시지 전송 payload:', payload);
      
      client.current.publish({
        destination: `/app/chat.send.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      return true;
    } catch (error) {
      console.error('[CHAT] 메시지 전송 오류:', error);
      return false;
    }
  }, [chatRoomId, roomUserId]); // 👈 roomUserId로 변경

  // 콕 찌르기 전송
  const sendPoke = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      console.warn('[CHAT] 찌르기 전송 실패: 연결되지 않음');
      return false;
    }

    try {
      // 1. 찌르기 API 호출
      const pokeResponse = await fetch('/poke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
      });

      if (!pokeResponse.ok) {
        console.error('[CHAT] 찌르기 API 호출 실패:', pokeResponse.status);
        return false;
      }

      console.log('[CHAT] 📤 찌르기 API 호출 성공');

      // 2. 웹소켓으로 찌르기 메시지 전송
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId,
      };
      
      console.log('[CHAT] 📤 찌르기 웹소켓 전송:', payload);
      
      client.current.publish({
        destination: `/app/chat.poke.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      return true;
    } catch (error) {
      console.error('[CHAT] 찌르기 전송 오류:', error);
      return false;
    }
  }, [chatRoomId, roomUserId]);

  // 통화 시작
  const startCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) { // 👈 roomUserId로 변경
      console.warn('[CHAT] 통화 시작 실패: 연결되지 않음');
      return false;
    }

    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId, // 👈 roomUserId로 변경
      };
      
      console.log('[CHAT] 통화 시작 payload:', payload);
      
      client.current.publish({
        destination: `/app/chat.call.start.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      return true;
    } catch (error) {
      console.error('[CHAT] 통화 시작 오류:', error);
      return false;
    }
  }, [chatRoomId, roomUserId]); // 👈 roomUserId로 변경

  // 통화 수락
  const acceptCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) { // 👈 roomUserId로 변경
      console.warn('[CHAT] 통화 수락 실패: 연결되지 않음');
      return false;
    }

    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId, // 👈 roomUserId로 변경
      };
      
      console.log('[CHAT] 통화 수락 payload:', payload);
      
      client.current.publish({
        destination: `/app/chat.call.accept.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      return true;
    } catch (error) {
      console.error('[CHAT] 통화 수락 오류:', error);
      return false;
    }
  }, [chatRoomId, roomUserId]); // 👈 roomUserId로 변경

  // 통화 거절
  const rejectCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) { // 👈 roomUserId로 변경
      console.warn('[CHAT] 통화 거절 실패: 연결되지 않음');
      return false;
    }

    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId, // 👈 roomUserId로 변경
      };
      
      console.log('[CHAT] 통화 거절 payload:', payload);
      
      client.current.publish({
        destination: `/app/chat.call.reject.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      return true;
    } catch (error) {
      console.error('[CHAT] 통화 거절 오류:', error);
      return false;
    }
  }, [chatRoomId, roomUserId]); // 👈 roomUserId로 변경

  // 수동 재연결
  const reconnect = useCallback(() => {
    if (connectionState === 'failed' || connectionState === 'disconnected') {
      setReconnectAttempts(0);
      if (client.current?.active) {
        client.current.deactivate();
      }
    }
  }, [connectionState]);

  return {
    sendMessage,
    sendPoke,
    startCall,
    acceptCall,
    rejectCall,
    loadHistory,
    loadMoreHistory,
    reconnect,
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting' || connectionState === 'reconnecting',
    isLoadingHistory,
    canRetry: connectionState === 'failed' && reconnectAttempts < maxReconnectAttempts,
  };
};