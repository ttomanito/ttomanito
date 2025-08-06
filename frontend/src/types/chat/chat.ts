// src/types/chat.ts
export interface Message {
  sender: 'me' | 'other';
  type?: 'text' | 'poke'; // 확장 가능
  content?: string;
  time: string; // ISO string or "7:50 PM"
}
