// // src/types/chat.ts
// export interface Message {
//   sender: 'me' | 'other';
//   type?: 'text' | 'poke' | 'system'; // 확장 가능
//   content?: string;
//   time: string; // ISO string or "7:50 PM"
//   category?: 'exit'; // type이 'system'인 경우만 사용
// }

// chat.ts
export type SystemCategory = 'exit';

export interface SystemMessage {
  id: string;
  sender: 'system';
  content: string;
  time?: string;
  type: 'system';
  systemCategory: SystemCategory;
}

export interface TextMessage {
  id: string;
  sender: string;
  content: string;
  time?: string;
  type: 'text' | 'poke';
}

export type Message = SystemMessage | TextMessage;
