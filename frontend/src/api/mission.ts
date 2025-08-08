import { getRequest } from '@/api/requests';

export interface Mission {
  missionId: number;
  missionStatusId: number;
  title: string;
  description: string | null;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';
  channels: 'MEET' | 'CHAT' | 'CALL';
  type: 'GIFT' | 'COMMUNICATION' | 'PERFORMANCE' | 'NOTES' |'OBSERVATION';
  missionDate: string;
  completed: boolean;
}

export const fetchTodayMission = async (): Promise<Mission> => {
  return await getRequest<Mission>('/manito/mission');
};
