export interface User {
  userId: number;
  name: string;
  statusMessage: string;
  creatorId: number;
}
export const dummyParticipants: User[] = [
  { userId: 1, name: '안수진', statusMessage: '오늘도 화이팅', creatorId: 101 },
  { userId: 2, name: '김철수', statusMessage: '커피는 사랑입니다', creatorId: 101 },
  { userId: 3, name: '박영희', statusMessage: '마니또가 누구지?', creatorId: 101 },
  { userId: 4, name: '이민호', statusMessage: '노래듣기 좋아요', creatorId: 101 },
  { userId: 5, name: '정다은', statusMessage: '헷갈린다...', creatorId: 101 },
  { userId: 6, name: '정다은', statusMessage: '헷갈린다...', creatorId: 101 },
  { userId: 7, name: '정다은', statusMessage: '헷갈린다...', creatorId: 101 },
  { userId: 8, name: '정다은', statusMessage: '헷갈린다...', creatorId: 101 },
  { userId: 9, name: '정다은', statusMessage: '헷갈린다...', creatorId: 101 },
];
