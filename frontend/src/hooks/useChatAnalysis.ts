import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPartnerAnalysis } from '@/api/analysis';
import type { ChatAnalysisBrief } from '@/types/chat/analysis';

/**
 * 참여자별 1회 제한 UX:
 * 로컬 캐시 키: ANALYSIS::<chatRoomId>::<userId>
 * 서버가 200이면 캐시 저장, 409면 alreadyUsed=true 표시
 */
export function useChatAnalysis(chatRoomId: string | null, myUserId: string | null) {
  const cacheKey = useMemo(() => {
    if (!chatRoomId || !myUserId) return null;
    return `ANALYSIS::${chatRoomId}::${myUserId}`;
  }, [chatRoomId, myUserId]);

  const [data, setData] = useState<ChatAnalysisBrief | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 로컬 캐시 로드
  useEffect(() => {
    if (!cacheKey) return;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ChatAnalysisBrief;
        setData(parsed);
        setAlreadyUsed(true); // 이미 한 번 실행됨
      } catch {
        // ignore
      }
    } else {
      setData(null);
      setAlreadyUsed(false);
    }
  }, [cacheKey]);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(async () => {
    if (!chatRoomId || !myUserId) return;
    setError(null);
    setLoading(true);
    const res = await fetchPartnerAnalysis(chatRoomId);
    setLoading(false);

    if (res.ok) {
      setData(res.data);
      setAlreadyUsed(true);
      if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(res.data));
    } else {
      if (res.status === 409) {
        setAlreadyUsed(true);
        setError('이 채팅방에서 내 1회 분석 기회는 이미 사용되었습니다.');
      } else {
        setError(res.message || '분석 호출에 실패했습니다.');
      }
    }
  }, [chatRoomId, myUserId, cacheKey]);

  // 모달 열릴 때 데이터 없으면 자동 호출(최초 1회)
  useEffect(() => {
    if (isOpen && !data && !isLoading && !error) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { data, isOpen, open, close, run, isLoading, alreadyUsed, error };
}
