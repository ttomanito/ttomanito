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
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    return registration;
  } catch {
    return null;
  }
};

// FCM 토큰 요청
export const requestForToken = async (): Promise<string | null> => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  
  if (!vapidKey) {
    return null;
  }

  try {
    // 브라우저 지원 확인
    if (!('Notification' in window)) {
      throw new Error('브라우저가 알림을 지원하지 않습니다');
    }

    // 현재 권한 상태 확인
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      throw new Error(`알림 권한이 거부되었습니다 (현재: ${permission})`);
    }

    // 서비스 워커 등록
    await registerServiceWorker();

    // FCM 토큰 발급
    const currentToken = await getToken(messaging, { vapidKey });

    if (currentToken) {
      localStorage.setItem('fcm_token', currentToken);
      return currentToken;
    } else {
      throw new Error('토큰을 가져올 수 없습니다. VAPID 키를 확인해주세요.');
    }
  } catch {
    return null;
  }
};

// Foreground 메시지 수신
export const onMessageListener = (): Promise<FCMMessagePayload> =>
  new Promise((resolve) => {
    onMessage(messaging, (payload: MessagePayload) => {
      const fcmPayload = payload as FCMMessagePayload;
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted' && fcmPayload.notification) {
        const notification = new Notification(
          fcmPayload.notification.title || '새 알림', 
          {
            body: fcmPayload.notification.body,
            icon: fcmPayload.notification.icon || '/icons/android-chrome-192x192.png',
            badge: '/icons/android-chrome-72x72.png',
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
    return null;
  }

  try {
    const newToken = await getToken(messaging, { vapidKey });
    const savedToken = localStorage.getItem('fcm_token');
    
    if (newToken && newToken !== savedToken) {
      localStorage.setItem('fcm_token', newToken);
      return newToken;
    }
    
    return savedToken;
  } catch {
    return null;
  }
};

// 서버에 토큰 전송
export const sendTokenToServer = async (token: string, userId: string): Promise<boolean> => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    
    if (!baseUrl) {
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

    return response.ok;
  } catch {
    return false;
  }
};

export { messaging };
export type { FCMMessagePayload, NotificationPayload };
