import { getRequest } from '@/api/requests';
import type { ChatAnalysisBrief } from '@/types/chat/analysis';

export async function fetchPartnerAnalysis(chatRoomId: string, limit = 200) {
  try {
    const res = await getRequest<ChatAnalysisBrief>(
      `/chat/${chatRoomId}/analysis/partner?limit=${limit}`
    );
    return { ok: true as const, data: res };
  } catch (e: any) {
    const status = e?.response?.status ?? 0;
    const message = e?.response?.data?.message ?? '요청 실패';
    return { ok: false as const, status, message };
  }
}