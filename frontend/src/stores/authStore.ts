// src/stores/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

type Tokens = { accessToken: string | null; refreshToken: string | null }
type User   = { id: string; name: string; role?: string } | null

type AuthState = {
  user: User
  tokens: Tokens
  hydrated: boolean

  // 로그인 여부를 boolean 상태로 관리
  isAuthenticated: boolean

  setTokens: (t: Tokens) => void
  setUser:   (u: User)   => void
  logout:    ()           => void
  markHydrated: ()        => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      hydrated: false,
      isAuthenticated: false,

      setTokens: (tokens) => {
        // 쿠키에도 같이 저장
        if (tokens.accessToken) {
          Cookies.set('accessToken', tokens.accessToken)
        }
        if (tokens.refreshToken) {
          Cookies.set('refreshToken', tokens.refreshToken)
        }
        set({
          tokens,
          isAuthenticated: !!tokens.accessToken,
        })
      },

      setUser: (user) =>
        set({ user }),

      logout: () => {
        // 메모리 상태 초기화
        set({
          user: null,
          tokens: { accessToken: null, refreshToken: null },
          isAuthenticated: false,
        })
        // persist된 로컬스토리지 키 삭제
        localStorage.removeItem('auth')
        // 쿠키 삭제
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
      },

      markHydrated: () =>
        set({ hydrated: true }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tokens:          s.tokens,
        user:            s.user,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        state?.markHydrated()
        if (error) console.error('rehydration error', error)
      },
    },
  ),
)
