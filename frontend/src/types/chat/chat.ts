export interface Message {
  id: string; 
  sender: string; 
  content: string;
  time: string; 
  type: 'text' | 'poke' | 'call_start' | 'call_accept' | 'call_reject' | 'system';
  systemCategory?: 'exit';
  originalSentAt?: string; 
  originalType?: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
}

export interface ReceivedMessage {
  chattingRoomId: number;
  senderRoomUserId: number;
  senderUserId: number;
  content: string | null;
  type: 'TEXT' | 'POKE' | 'CALL_START' | 'CALL_ACCEPT' | 'CALL_REJECT';
  sentAt: string; 
}


export interface HistoryRequest {
  before?: string; 
}

export interface ChatStatistics {
  chattingRoomId: number;
  senderRoomUserId: number;
  count: number;
}