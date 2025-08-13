// src/types/chat/chat.ts - MongoDB 구조 반영 업데이트

export interface Message {
  id: string; // 클라이언트에서 생성하는 고유 ID
  sender: string; // senderRoomUserId를 string으로 변환
  content: string;
  time: string; // 표시용 시간 (HH:MM 형식)
  type: 'text' | 'poke' | 'call_start' | 'call_accept' | 'call_reject' | 'system';
  systemCategory?: 'exit';
  // 원본 백엔드 데이터
  originalSentAt?: string; // 페이징용 원본 시간
  originalType?: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
}

// 백엔드 응답 타입 (재정의)
export interface ReceivedMessage {
  chattingRoomId: number;
  senderRoomUserId: number;
  senderUserId: number;
  content: string | null;
  type: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
  sentAt: string; // ISO 형식의 LocalDateTime
}

// 히스토리 요청 타입
export interface HistoryRequest {
  before?: string; // LocalDateTime 문자열
}

// 메시지 통계 타입 (추후 확장용)
export interface ChatStatistics {
  chattingRoomId: number;
  senderRoomUserId: number;
  count: number;
}