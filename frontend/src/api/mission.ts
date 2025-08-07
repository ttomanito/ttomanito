import { getRequest } from '@/api/requests';

export interface Mission {
  id: number;
  title: string;
  description: string | null;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';
  channel: 'MEET' | 'CHAT' | 'CALL';
  type: 'GIFT' | 'COMMUNICATION' | 'PERFORMANCE' | 'NOTES' |'OBSERVATION';
  completed: boolean;
  missionStatusId: number;
}

export const fetchTodayMission = async (): Promise<Mission> => {
  return await getRequest<Mission>('/manito/mission');
};
