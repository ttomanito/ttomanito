/**
 * src/stores/auth.ts
 * ✅ 이 파일은 "인증 상태(Auth)"를 관리하는 Zustand 스토어입니다.
 * - 토큰(access/refresh)과 사용자 정보(user)를 zustand 상태로 들고 있습니다.
 * - zustand/middleware의 `persist`로 localStorage에 일부 상태를 "저장/복원"합니다.
 * - 앱 시작 시 저장소에서 읽어오는 "재수화(rehydrate)가 끝났는지"를
 *   hydrated 플래그로 알려줍니다. (초기 깜빡임/오판 방지)
 *
 * 사용 예(간단):
 *   const isAuthed = useAuth((s) => s.isAuthenticated)
 *   const login = () => useAuth.getState().setTokens({ accessToken: '...', refreshToken: '...' })
 *   const logout = () => useAuth.getState().logout()
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
/**
 * 🔑 서버로부터 받는 토큰 객체 형태(예시).
 * - accessToken: API 호출 때 Authorization 헤더에 붙는 토큰
 * - refreshToken: accessToken이 만료되었을 때 재발급 받을 때 쓰는 토큰
 */
type Tokens = { accessToken: string | null; refreshToken: string | null }

/**
 * 👤 로그인한 사용자 정보 형태(예시).
 * - 실제 프로젝트에 따라 필드를 자유롭게 늘리면 됩니다.
 */
type User = { id: string; name: string; role?: string } | null

/**
 * 🧰 zustand 스토어가 보관/제공하는 상태와 메서드의 타입 정의
 */
type AuthState = {
  /** 현재 로그인한 사용자 정보 (없으면 null) */
  user: User
  /** 현재 보관 중인 토큰 묶음 */
  tokens: Tokens

  /**
   * 💡 "재수화(rehydrate)가 끝났는지"를 알려주는 플래그
   * - 앱이 처음 켜질 때, localStorage에 저장된 값을 읽어와 스토어에 합칩니다(재수화).
   * - 그 작업이 끝나면 true가 됩니다.
   * - 보호 라우트/초기 API 호출 전 이 플래그가 true인지 확인하면
   *   "잠깐 로그아웃처럼 보이는 문제"를 막을 수 있습니다.
   */
  hydrated: boolean

  /**
   * ✅ 파생값(derived value):
   * - 현재 accessToken이 존재하면 "로그인한 상태"로 봅니다.
   * - 렌더 시 `useAuth(s => s.isAuthenticated)`로 간단히 사용 가능.
   * - 상태로 "저장"하지 않고, 읽을 때마다 계산(실제 토큰과 불일치 방지).
   */
  isAuthenticated: boolean

  /** 토큰 저장/교체 (로그인/재발급 시 사용) */
  setTokens: (t: Tokens) => void
  /** 사용자 정보 저장/교체 (/me 요청 결과 등을 반영) */
  setUser: (u: User) => void

  /**
   * 로그아웃:
   * - 메모리 상태의 user/tokens를 초기화합니다.
   * - (옵션) localStorage의 'auth' 키 자체도 제거합니다.
   */
  logout: () => void

  /** 내부에서 재수화 완료 시점을 기록하기 위한 setter */
  markHydrated: () => void
}

/**
 * 🏪 zustand 스토어 생성
 * - `persist` 미들웨어로 감싸서 일부 상태를 localStorage에 저장합니다.
 * - name='auth'로 저장되며, JSON 직렬화 저장소(createJSONStorage)를 사용합니다.
 */
export const useAuth = create<AuthState>()(
  persist(
    /**
     * (1) 실제 스토어 로직: 상태/메서드 정의
     * - set: 상태를 바꾸는 함수
     * - get: 현재 상태를 읽는 함수
     */
    (set, get) => ({
      // 기본값들: 앱 최초 구동 시 메모리의 초기 상태
      user: null,
      tokens: { accessToken: null, refreshToken: null },

      // 아직 재수화(rehydrate)가 끝나지 않았으므로 false로 시작
      hydrated: false,

      // 파생값: accessToken 존재 여부로 로그인 상태 판단
      get isAuthenticated() {
        const state = get?.()
        return !!state?.tokens?.accessToken
      },

      // 토큰 저장/교체(로그인·재발급)
      setTokens: (tokens) => set({ tokens }),

      // 사용자 정보 저장/교체(/me 응답 반영 등)
      setUser: (user) => set({ user }),

      // 로그아웃 로직
      logout: () => {
        // 1) 메모리 상태 초기화
        set({ user: null, tokens: { accessToken: null, refreshToken: null } })

        // 2) (선택) 저장소의 'auth' 키 제거
        //    - persist로 저장된 값 자체를 지우고 싶으면 사용하세요.
        //    - 멀티탭 동기화를 하려면 'storage' 이벤트 리스너도 고려.
        localStorage.removeItem('auth')
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')  
      },

      // 재수화가 끝났음을 표시하는 내부용 메서드
      markHydrated: () => set({ hydrated: true }),
    }),

    /**
     * (2) persist 옵션
     * - name: localStorage에 저장될 키 이름
     * - storage: 어떤 저장소를 쓸지 지정(여기선 window.localStorage)
     * - partialize: "어떤 상태만" 저장할지 선택
     * - onRehydrateStorage: 저장소 -> 메모리 "복원" 시작/종료 시 훅
     */
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),

      /**
       * 🧹 partialize:
       * - 스토어 전체를 저장하지 않고, 필요한 일부만 저장합니다.
       * - 여기서는 tokens/user만 저장(불필요/민감 데이터 노출 최소화).
       */
      partialize: (s) => ({ tokens: s.tokens, user: s.user }),

      /**
       * 🔄 onRehydrateStorage:
       * - 앱 시작 시, localStorage에 저장된 값을 메모리 상태에 합치는
       *   "재수화(rehydrate)" 과정의 시작/종료 타이밍에 개입할 수 있습니다.
       * - 반환하는 함수가 "재수화 종료(after) 콜백"입니다.
       * - 여기에서 hydrated=true로 바꿔주면,
       *   라우터 가드/초기 API 등의 로직을 안전하게 시작할 수 있습니다.
       */
      onRehydrateStorage: () => {
        // (before) 재수화 시작 직전: 필요하면 로깅/타이머 등을 둘 수 있음
        return (state, error) => {
          // (after) 재수화 종료: 정상/에러와 무관하게 끝난 시점
          state?.markHydrated()
          if (error) console.error('rehydration error', error)
        }
      },
    },
  ),
)

/**
 * 📌 사용 팁
 * 1) 보호 라우트에서:
 *    const hydrated = useAuth(s => s.hydrated)
 *    const isAuthed = useAuth(s => s.isAuthenticated)
 *    if (!hydrated) return <Splash/>            // 재수화가 끝날 때까지 대기
 *    return isAuthed ? <Outlet/> : <Navigate to="/login" />
 *
 * 2) Axios 인터셉터에서:
 *    요청 전에 const token = useAuth.getState().tokens.accessToken 를 읽어
 *    Authorization 헤더에 붙이세요.
 *
 * 3) 보안 주의:
 *    토큰을 localStorage에 두면 XSS에 취약합니다.
 *    장기적으로는 httpOnly 쿠키 기반 인증을 고려해 보세요.
 */
