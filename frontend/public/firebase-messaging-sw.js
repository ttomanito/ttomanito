// public/firebase-messaging-sw.js

// Firebase SDK 임포트 (CDN 방식)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase 설정 (실제 값으로 교체)
const firebaseConfig = {
  apiKey: "AIzaSyBG961AKeNjLCqaZA_JE2eejfsoFUeNlN8", // 수정됨
  authDomain: "ttomanito-ac231.firebaseapp.com",
  projectId: "ttomanito-ac231",
  storageBucket: "ttomanito-ac231.firebasestorage.app",
  messagingSenderId: "660422053988", // 수정됨
  appId: "1:660422053988:web:b03c3e5aa4129994828f71", // 수정됨
  measurementId: "G-K6CK5LTYCC"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 생성
const messaging = firebase.messaging();


// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {

  const notificationTitle = payload.notification?.title || '새 알림';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 메시지가 도착했습니다',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'background-notification',
    requireInteraction: false,
    silent: false,
    data: {
      click_action: payload.fcm_options?.link || '/',
      url: payload.fcm_options?.link || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: '열기'
      },
      {
        action: 'close', 
        title: '닫기'
      }
    ]
  };

  // 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const clickAction = event.notification.data?.click_action || '/';
  
  // 해당 URL로 이동하거나 새 창 열기
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // 이미 열린 탭이 있는지 확인
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: clickAction
          });
          return client.focus();
        }
      }
      
      // 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});