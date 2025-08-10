/**
 * src/stores/auth.ts
 * ✅ 인증 및 게임 상태를 관리하는 Zustand 스토어 (Axios 기반)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { postRequest } from '@/api/requests'

type Tokens = { accessToken: string | null; refreshToken: string | null }
type User = { id: string; name: string; role?: string } | null

type GameInfo = {
  isInGame: boolean
  roomId: number | null
  isCreator: boolean
}

type AuthState = {
  user: User
  tokens: Tokens
  gameInfo: GameInfo
  hydrated: boolean
  isAuthenticated: boolean

  setTokens: (t: Tokens) => void
  setUser: (u: User) => void
  joinGame: (roomId: number, isCreator: boolean) => Promise<void>
  leaveGame: () => void
  finishGame: () => void
  logout: () => void
  markHydrated: () => void
}

const initialGameInfo: GameInfo = {
  isInGame: false,
  roomId: null,
  isCreator: false,
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      gameInfo: initialGameInfo,
      hydrated: false,

      get isAuthenticated() {
        const state = get?.()
        return !!state?.tokens?.accessToken
      },

      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),

      // 게임 시작 API 호출 + 상태 업데이트
      joinGame: async (roomId, isCreator) => {
        try {
          await postRequest(`/room/${roomId}/start`)

          set({
            gameInfo: {
              isInGame: true,
              roomId,
              isCreator,
            },
          })
        } catch (error) {
          console.error('[authStore] 게임 시작 중 오류:', error)
        }
      },

      leaveGame: () => set({ gameInfo: initialGameInfo }),
      finishGame: () => set({ gameInfo: initialGameInfo }),

      logout: () => {
        set({
          user: null,
          tokens: { accessToken: null, refreshToken: null },
          gameInfo: initialGameInfo,
        })
        localStorage.removeItem('auth')
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
      },

      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tokens: s.tokens,
        user: s.user,
        gameInfo: s.gameInfo,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          state?.markHydrated()
          if (error) console.error('rehydration error', error)
        }
      },
    },
  ),
)
