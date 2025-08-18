# firebase.md

# Firebase FCM(Firebase Cloud Messaging) 푸시 알림 포팅 매뉴얼

## 1. 사용 목적

- **Firebase Cloud Messaging(FCM)** 기반 실시간 푸시 알림 서비스 제공
- 웹/모바일 환경에서 백그라운드/포그라운드 알림 지원
- 채팅, 미션, 알림 등 다양한 메시지 유형별 푸시 전송
- 토큰 관리 및 만료된 토큰 자동 정리

---

## 2. 서비스 정보

- **외부 서비스명**: Firebase Cloud Messaging (FCM)
- **사용 프로토콜**: HTTP/2 기반 Firebase Admin SDK
- **주요 Endpoint**
  - 토큰 등록: `POST /push/token`
  - 토큰 해제: `DELETE /push/token?token={token}`
  - 모든 토큰 해제: `DELETE /push/tokens`

---

## 3. 설정 값 및 환경 변수

### Backend 환경 변수

| 환경 변수 | 설명 |
| --- | --- |
| `fcm.enabled` | FCM 기능 활성화 여부 (true/false) |
| `fcm.credentials.location` | Firebase 서비스 계정 JSON 파일 경로 (선택사항) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Firebase 서비스 계정 JSON 파일 경로 (ADC 방식) |

### Frontend 환경 변수

| 환경 변수 | 설명 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase 프로젝트 API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase 스토리지 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM 발신자 ID |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics 측정 ID |
| `VITE_FIREBASE_VAPID_KEY` | 웹 푸시 VAPID 키 |
| `VITE_BASE_URL` | 백엔드 API 서버 URL |

---

## 4. Firebase 프로젝트 설정

### (1) Firebase Console 설정

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
   - Google Analytics 활성화 (선택사항)

2. **웹 앱 추가**
   - 프로젝트 설정 → 앱 추가 → 웹
   - 앱 닉네임 입력 및 Firebase SDK 구성 정보 복사

3. **Cloud Messaging 설정**
   - 프로젝트 설정 → Cloud Messaging 탭
   - 웹 푸시 인증서 → VAPID 키 생성/복사

4. **서비스 계정 키 생성**
   - 프로젝트 설정 → 서비스 계정 탭
   - "새 비공개 키 생성" → JSON 파일 다운로드

### (2) Firebase 규칙 설정

Firebase Hosting을 사용

---

## 5. 동작 방식

### (1) 토큰 등록 플로우

1. **클라이언트**: 앱 시작 시 `requestForToken()` 호출
2. **브라우저**: 알림 권한 요청 → 사용자 승인
3. **FCM**: VAPID 키 기반 토큰 발급
4. **클라이언트**: `POST /push/token`으로 토큰 서버 등록
5. **서버**: 토큰을 DB에 저장 (중복 시 활성화)

### (2) 메시지 전송 플로우

1. **서버**: 알림 대상 사용자 ID 목록 조회
2. **PushTokenService**: 유효한 토큰 목록 조회
3. **FcmService**: FCM API로 일괄 전송 (500개씩 분할)
4. **FCM**: 각 기기로 푸시 메시지 전달
5. **클라이언트**: 
   - **포그라운드**: `onMessage` 콜백으로 처리
   - **백그라운드**: Service Worker가 알림 표시

### (3) 토큰 만료 처리

1. **FCM 응답**: `NOT_FOUND`, `INVALID_ARGUMENT` 오류 수신
2. **FcmService**: 해당 토큰을 자동으로 비활성화
3. **클라이언트**: 토큰 갱신 시 서버에 재등록
