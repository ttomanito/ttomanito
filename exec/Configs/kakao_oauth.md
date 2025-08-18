# 카카오 소셜 로그인/로그아웃 포팅 매뉴얼

## 1. 사용 목적

- 카카오 OAuth2 기반 **소셜 로그인/로그아웃** 기능 제공
- 로그인 시 JWT Access/Refresh 토큰을 발급하고 쿠키 저장
- 로그아웃 시 서비스 쿠키 삭제 및 카카오 로그아웃 API와 연동

---

## 2. 서비스 정보

- **외부 서비스명**: Kakao OAuth2
- **사용 프로토콜**: OAuth 2.0 Authorization Code Grant (OIDC 프로필 사용)
- **주요 Endpoint**
    - 로그인 요청: `/oauth2/authorization/kakao`
    - 카카오 인증 콜백: `/login/oauth2/code/kakao`
    - 로그아웃 요청: `/auth/logout`
    - 카카오 로그아웃 안내 페이지: `/auth/kakao/logout-page`
    - 카카오 로그아웃 콜백: `/auth/kakao/logout/callback`

---

## 3. 설정 값 및 환경 변수

| 환경 변수 | 설명 |
| --- | --- |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 앱 시크릿 (필요 시) |
| `spring.security.oauth2.client.registration.kakao.redirect-uri` | `{baseUrl}/login/oauth2/code/kakao` |
| `spring.security.oauth2.client.registration.kakao.scope` | `openid, profile_nickname` |
| `kakao.logout.redirect-uri` | 카카오 로그아웃 후 호출될 콜백 URI |
| `url.redirect.base` | 로그인/로그아웃 후 프론트엔드 리다이렉트 URL |
| `JWT_SECRET` | JWT 서명용 시크릿 키 |
| `jwt.access.time` | AccessToken 유효시간 (ms) |
| `jwt.refresh.time` | RefreshToken 유효시간 (ms) |

---

## 4. 동작 방식

### (1) 로그인 플로우

1. 클라이언트 → `/oauth2/authorization/kakao` 요청
2. 카카오 로그인 성공 시 → `/login/oauth2/code/kakao` 콜백
3. `SocialUserService` → 신규 유저 자동 가입 또는 기존 계정 매핑
    - `nickname` 클레임 → 없을 경우 `kakao_account.profile.nickname` 추출
    - 그래도 없으면 `kakao_{providerId}` 기본 닉네임 부여
4. `OAuth2AuthenticationSuccessHandler`:
    - JWT Access/Refresh 토큰 발급 (`JwtProvider`)
    - RefreshToken DB 저장 (`RefreshTokenRepository`)
    - AccessToken, RefreshToken, KakaoAccessToken 쿠키 저장 (`CookieUtils`)
    - 프론트 `/main` 으로 리다이렉트

---

### (2) 인증 처리

- 모든 요청은 `JwtAuthenticationFilter`에서 토큰 검증
    - 우선순위: `Authorization: Bearer ...` → 없으면 `accessToken` 쿠키 확인
    - 유효성 검사 후 `SecurityContext`에 인증 객체 저장
- 토큰 무효/사용자 탈퇴 시:
    - `accessToken`, `refreshToken` 쿠키 삭제
    - SecurityContext 초기화

---

### (3) 로그아웃 플로우

- `/auth/logout`:
    - `accessToken`, `refreshToken`, `JSESSIONID`, `kakaoAccessToken` 쿠키 삭제
    - HTTP 204 반환
- `/auth/kakao/logout-page`:
    - 카카오 로그아웃 안내 페이지로 리다이렉트
- `/auth/kakao/logout/callback`:
    - 카카오에서 리다이렉트 후 모든 서비스 쿠키 삭제
    - 프론트엔드 `/login` 페이지로 이동

---

## 5. 특이사항

- 로그인 실패 시: `/login?error=메시지` 로 리다이렉트
- RefreshToken 재발급 API: `/auth/refresh` (쿠키 기반)
- HTTPS 환경에서만 `SameSite=None; Secure` 적용
- Swagger/OpenAPI(`/swagger-ui`, `/v3/api-docs`)는 필터 예외 처리
- WebSocket 연결(`/ws/**`)은 토큰 없이 접근 가능하도록 별도 고려 가능