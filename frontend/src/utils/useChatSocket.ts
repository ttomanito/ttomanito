import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { postRequest } from '@/api/requests';

interface ReceivedMessage {
  chattingRoomId: number;
  senderRoomUserId: number;
  senderUserId: number;
  content: string | null;
  type: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
  sentAt: string; // LocalDateTime → string (ISO format)
}


interface HistoryRequest {
  before?: string; // LocalDateTime 문자열 또는 undefined
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

interface UseChatSocketProps {
  chatRoomId: string | null;
  roomUserId: string | null; 
  onMessage: (msg: ReceivedMessage) => void;
  onHistoryLoaded?: (messages: ReceivedMessage[], hasMore: boolean) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export const useChatSocket = ({ 
  chatRoomId, 
  roomUserId,
  onMessage,
  onHistoryLoaded,
  onConnectionStateChange 
}: UseChatSocketProps) => {
  const client = useRef<Client | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const maxReconnectAttempts = 5;
  const HISTORY_PAGE_SIZE = 50; 
  
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
    const messageId = `${msg.senderRoomUserId}-${msg.sentAt}`;
    if (processedMessageIds.current.has(messageId)) {
      return;
    }
    processedMessageIds.current.add(messageId);
    onMessageRef.current(msg);
    // 최근 200개 메시지 ID만 유지
    if (processedMessageIds.current.size > 200) {
      const messageIds = Array.from(processedMessageIds.current);
      const recentIds = messageIds.slice(-100);
      processedMessageIds.current = new Set(recentIds);
    }
  }, []);

  useEffect(() => {
    if (!chatRoomId || !roomUserId) { 
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
        'X-User-Id': roomUserId,           
        'X-Chat-Room-Id': chatRoomId,     
      },
      reconnectDelay: Math.min(5000 * Math.pow(2, reconnectAttempts), 30000),
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},

      onConnect: () => {
        updateConnectionState('connected');
        setReconnectAttempts(0);

        try {
          stompClient.subscribe(`/user/queue/chat.${chatRoomId}`, (res: IMessage) => {
            try {
              type SocketPayload<T> = { type: 'HISTORY' | 'MESSAGE'; data: T };
              const payload = JSON.parse(res.body) as SocketPayload<ReceivedMessage[] | ReceivedMessage>;
              if (payload.type === 'HISTORY') {
                const history = payload.data as ReceivedMessage[];
                history.forEach(msg => processedMessageIds.current.add(`${msg.senderRoomUserId}-${msg.sentAt}`));
                const hasMore = history.length >= HISTORY_PAGE_SIZE;
                onHistoryLoadedRef.current?.(history, hasMore);
                setIsLoadingHistory(false);
              } else if (payload.type === 'MESSAGE') {
                handleMessage(payload.data as ReceivedMessage);
              }
            } catch {
              setIsLoadingHistory(false);
            }
          });

          // 실시간 메시지 구독
          stompClient.subscribe(`/topic/chat.${chatRoomId}`, (res: IMessage) => {
            try {
              const msg = JSON.parse(res.body) as ReceivedMessage;
              handleMessage(msg);
            } catch {
              // ignore parsing error
            }
          });

          // 연결 완료 후 바로 히스토리 요청
          setIsLoadingHistory(true);
          stompClient.publish({
            destination: `/app/chat.history.${chatRoomId}`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
          });
        } catch {
          updateConnectionState('failed');
        }
      },

      onDisconnect: () => {
        updateConnectionState('disconnected');
      },

      onStompError: () => {
        updateConnectionState('failed');
      },

      onWebSocketError: () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          updateConnectionState('reconnecting');
          setReconnectAttempts(prev => prev + 1);
        } else {
          updateConnectionState('failed');
        }
      }
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      if (client.current?.active) {
        client.current.deactivate();
      }
    };
  }, [chatRoomId, roomUserId, handleMessage, updateConnectionState, reconnectAttempts]); 

  // 히스토리 로드 (페이징 지원)
  const loadHistory = useCallback((beforeDateTime?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!client.current?.connected || !chatRoomId || isLoadingHistory) {
        resolve(false);
        return;
      }
      try {
        setIsLoadingHistory(true);
        const historyRequest: HistoryRequest = beforeDateTime 
          ? { before: beforeDateTime }
          : {}; 
        client.current.publish({
          destination: `/app/chat.history.${chatRoomId}`,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(historyRequest),
        });
        resolve(true);
      } catch {
        setIsLoadingHistory(false);
        resolve(false);
      }
    });
  }, [chatRoomId, roomUserId, isLoadingHistory]);

  const loadMoreHistory = useCallback((oldestMessageDateTime: string) => {
    return loadHistory(oldestMessageDateTime);
  }, [loadHistory]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      return false;
    }
    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId, 
        content,
      };
      client.current.publish({
        destination: `/app/chat.send.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }, [chatRoomId, roomUserId]);

  const sendPoke = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      return false;
    }
    try {
      await postRequest('/poke');
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId,
      };
      client.current.publish({
        destination: `/app/chat.poke.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }, [chatRoomId, roomUserId]);

  const startCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      return false;
    }
    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId,
      };
      client.current.publish({
        destination: `/app/chat.call.start.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }, [chatRoomId, roomUserId]);

  const acceptCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      return false;
    }
    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId,
      };
      client.current.publish({
        destination: `/app/chat.call.accept.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }, [chatRoomId, roomUserId]);

  const rejectCall = useCallback(async (): Promise<boolean> => {
    if (!client.current?.connected || !chatRoomId || !roomUserId) {
      return false;
    }
    try {
      const payload = {
        chattingRoomId: +chatRoomId,
        senderRoomUserId: +roomUserId,
      };
      client.current.publish({
        destination: `/app/chat.call.reject.${chatRoomId}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }, [chatRoomId, roomUserId]);

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
