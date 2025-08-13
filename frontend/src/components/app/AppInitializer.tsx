// src/components/app/AppInitializer.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '@/stores/authStore';
import Loading from '@/routes/Loading';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  // 컴포넌트 내부의 로컬 상태를 사용하여 초기화 여부를 딱 한 번만 관리합니다.
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 앱 시작 시 항상 서버 상태 동기화 시도
    useAuth.getState().syncAllFromServer()
      .catch(err => {
        console.error('[INIT] Failed to sync state with server:', err);
      })
      .finally(() => {
        // API 요청의 성공/실패 여부와 관계없이 초기화는 완료된 것으로 처리합니다.
        setIsInitialized(true);
      });
  // 🔥 의존성 배열을 빈 배열 `[]`로 하여 이 useEffect가 마운트 시
  //    단 한 번만 실행되도록 보장합니다. 이것이 무한 루프를 막는 핵심입니다.
  }, []); 

  // 초기화가 완료될 때까지 로딩 화면을 보여줍니다.
  if (!isInitialized) {
    return <Loading />;
  }

  // 초기화 완료 후 실제 앱 콘텐츠를 렌더링합니다.
  return <>{children}</>;
}