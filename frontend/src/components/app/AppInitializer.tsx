// src/components/app/AppInitializer.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '@/stores/authStore';
import Loading from '@/routes/Loading';
import { postRequest } from '@/api/requests';

// Firebase FCM imports
import {
  requestForToken,
  onMessageListener,
  type FCMMessagePayload,
} from '@/firebase/messaging';

type Props = {
  children: React.ReactNode;
  /** FCM 초기화 지연 시간(ms). 기본 3000 */
  fcmDelayMs?: number;
}

export default function AppInitializer({ children, fcmDelayMs = 3000 }: Props) {
  // 컴포넌트 내부의 로컬 상태를 사용하여 초기화 여부를 딱 한 번만 관리합니다.
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmInitialized, setFcmInitialized] = useState(false);
  
  const auth = useAuth();

  // 1) 앱 초기화: 서버 상태 동기화
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

  // 2) FCM 초기화 (한 번만 실행)
  useEffect(() => {
    // 이미 초기화되었으면 실행하지 않음
    if (fcmInitialized) return;

    const initializeFCM = async () => {
      try {
        console.log('🔔 FCM 초기화 시작...');

        // FCM 토큰 요청
        const token = await requestForToken();
        
        if (token) {
          setFcmToken(token);
          console.log('✅ FCM 토큰 발급 성공');

          // 🔒 서버에 토큰 등록 (API 함수 사용)
          try {
            await postRequest('/push/token', { token });
            console.log('✅ FCM 토큰 서버 등록 성공');
          } catch (error) {
            console.error('❌ FCM 토큰 서버 등록 에러:', error);
          }

          // Foreground 메시지 리스너 설정
          onMessageListener()
            .then((payload: FCMMessagePayload) => {
              console.log('📨 푸시 메시지 수신:', payload);
              
              if (payload.notification?.title) {
                console.log('알림:', payload.notification.title);
              }
            })
            .catch((err) => console.error('❌ 메시지 리스너 에러:', err));

        } else {
          console.log('❌ FCM 토큰 발급 실패');
        }
      } catch (error) {
        console.error('❌ FCM 초기화 실패:', error);
      } finally {
        setFcmInitialized(true);
      }
    };

    // 3초 후에 FCM 초기화 (다른 초기화 완료 후)
    const timer = setTimeout(() => {
      initializeFCM();
    }, fcmDelayMs);

    return () => clearTimeout(timer);
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 개발 모드에서 FCM 상태 확인
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔔 FCM 상태:', {
        사용자: auth.user?.name || '로그인 안됨',
        FCM토큰: fcmToken ? '발급됨' : '없음',
        초기화여부: fcmInitialized
      });
    }
  }, [auth.user, fcmToken, fcmInitialized]);

  // 초기화가 완료될 때까지 로딩 화면을 보여줍니다.
  if (!isInitialized) {
    return <Loading />;
  }

  // 초기화 완료 후 실제 앱 콘텐츠를 렌더링합니다.
  return (
    <>
      {children}

    </>
  );
}