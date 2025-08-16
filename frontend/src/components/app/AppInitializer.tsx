import { useEffect, useState } from 'react';
import { useAuth } from '@/stores/authStore';
import Loading from '@/routes/Loading';
import { postRequest } from '@/api/requests';
import {
  requestForToken,
  onMessageListener,
} from '@/firebase/messaging';

type Props = {
  children: React.ReactNode;
  fcmDelayMs?: number;
}

export default function AppInitializer({ children, fcmDelayMs = 3000 }: Props) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [, setFcmToken] = useState<string | null>(null);
  const [fcmInitialized, setFcmInitialized] = useState(false);
  

  useEffect(() => {
    useAuth.getState().syncAllFromServer()
      .finally(() => {
        setIsInitialized(true);
      });
  }, []); 

  useEffect(() => {
    if (fcmInitialized) return;

    const initializeFCM = async () => {
      try {
        const token = await requestForToken();
        
        if (token) {
          setFcmToken(token);

          try {
            await postRequest('/push/token', { token });
          } catch {
            /* 서버 등록 실패 무시 */
          }

          onMessageListener().catch(() => {
            /* 메시지 리스너 에러 무시 */
          });
        }
      } finally {
        setFcmInitialized(true);
      }
    };

    const timer = setTimeout(() => {
      initializeFCM();
    }, fcmDelayMs);

    return () => clearTimeout(timer);
  }, []); 

  // 초기화가 완료될 때까지 로딩 화면
  if (!isInitialized) {
    return <Loading />;
  }

  return <>{children}</>;
}
