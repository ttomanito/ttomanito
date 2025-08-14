// src/firebase/messaging.ts
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  type Messaging, 
  type MessagePayload 
} from "firebase/messaging";
import { app } from "./config";

const messaging: Messaging = getMessaging(app);

// 타입 정의
interface NotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
}

interface FCMMessagePayload extends MessagePayload {
  notification?: NotificationPayload;
  data?: { [key: string]: string };
}

// 서비스 워커 등록
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ 브라우저가 서비스 워커를 지원하지 않습니다');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ 서비스 워커 등록 성공:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ 서비스 워커 등록 실패:', error);
    return null;
  }
};

// FCM 토큰 요청
export const requestForToken = async (): Promise<string | null> => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  
  if (!vapidKey) {
    console.error('❌ VAPID 키가 설정되지 않았습니다');
    return null;
  }

  try {
    // 브라우저 지원 확인
    if (!('Notification' in window)) {
      throw new Error('브라우저가 알림을 지원하지 않습니다');
    }

    // 현재 권한 상태 확인
    let permission = Notification.permission;
    
    // 권한이 기본값이면 요청
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      throw new Error(`알림 권한이 거부되었습니다 (현재: ${permission})`);
    }

    console.log('✅ 알림 권한 허용됨');

    // 서비스 워커 등록
    await registerServiceWorker();

    // FCM 토큰 발급
    const currentToken = await getToken(messaging, { vapidKey });

    if (currentToken) {
      console.log('✅ FCM 토큰 발급 성공');
      console.log('토큰:', currentToken.substring(0, 50) + '...');
      
      // 토큰을 localStorage에 저장
      localStorage.setItem('fcm_token', currentToken);
      
      return currentToken;
    } else {
      throw new Error('토큰을 가져올 수 없습니다. VAPID 키를 확인해주세요.');
    }
  } catch (error) {
    console.error('❌ FCM 토큰 발급 실패:', error);
    return null;
  }
};

// Foreground 메시지 수신
export const onMessageListener = (): Promise<FCMMessagePayload> =>
  new Promise((resolve) => {
    onMessage(messaging, (payload: MessagePayload) => {
      console.log('📨 Foreground 메시지 수신:', payload);
      
      const fcmPayload = payload as FCMMessagePayload;
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted' && fcmPayload.notification) {
        const notification = new Notification(
          fcmPayload.notification.title || '새 알림', 
          {
            body: fcmPayload.notification.body,
            icon: fcmPayload.notification.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'fcm-notification',
            requireInteraction: false,
            silent: false
          }
        );

        // 알림 클릭 이벤트
        notification.onclick = function() {
          window.focus();
          notification.close();
        };

        // 3초 후 자동 닫기
        setTimeout(() => notification.close(), 3000);
      }
      
      resolve(fcmPayload);
    });
  });

// 토큰 갱신 확인
export const checkTokenRefresh = async (): Promise<string | null> => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  
  if (!vapidKey) {
    console.error('❌ VAPID 키가 설정되지 않았습니다');
    return null;
  }

  try {
    const newToken = await getToken(messaging, { vapidKey });
    const savedToken = localStorage.getItem('fcm_token');
    
    if (newToken && newToken !== savedToken) {
      console.log('🔄 FCM 토큰이 갱신되었습니다');
      localStorage.setItem('fcm_token', newToken);
      return newToken;
    }
    
    return savedToken;
  } catch (error) {
    console.error('❌ 토큰 갱신 확인 실패:', error);
    return null;
  }
};

// 서버에 토큰 전송
export const sendTokenToServer = async (token: string, userId: string): Promise<boolean> => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    
    if (!baseUrl) {
      console.error('❌ VITE_BASE_URL이 설정되지 않았습니다');
      return false;
    }

    const response = await fetch(`${baseUrl}/users/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fcmToken: token,
      }),
    });

    if (response.ok) {
      console.log('✅ FCM 토큰 서버 전송 성공');
      return true;
    } else {
      console.warn('⚠️ FCM 토큰 서버 전송 실패:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ FCM 토큰 서버 전송 에러:', error);
    return false;
  }
};

export { messaging };
export type { FCMMessagePayload, NotificationPayload };