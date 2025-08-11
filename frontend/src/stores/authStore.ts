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
  setGameInfo: (info: Partial<GameInfo>) => void
  joinGame: (roomId: number, isCreator: boolean) => Promise<void>
  startGame: (roomId: number) => Promise<void>
  checkCreatorStatus: () => Promise<boolean>
  syncGameState: () => Promise<void>
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

      // 게임 정보 부분 업데이트
      setGameInfo: (info) => set((state) => ({
        gameInfo: { ...state.gameInfo, ...info }
      })),

      // 현재 사용자가 방장인지 서버에서 확인
      checkCreatorStatus: async () => {
        try {
          const response = await postRequest('/room/creator')
          const isCreator = response === true || response === 'true'
          
          // 상태 업데이트
          const currentState = get()
          if (currentState.gameInfo.isCreator !== isCreator) {
            set((state) => ({
              gameInfo: { ...state.gameInfo, isCreator }
            }))
          }
          
          return isCreator
        } catch (error) {
          console.error('[authStore] 방장 여부 확인 중 오류:', error)
          return false
        }
      },

      // 게임 상태 전체 동기화 (페이지 새로고침 후 등)
      syncGameState: async () => {
        try {
          const currentState = get()
          if (!currentState.gameInfo.isInGame || !currentState.gameInfo.roomId) {
            return
          }

          // 방장 여부 확인
          const isCreator = await get().checkCreatorStatus()
          
          console.log(`[authStore] 게임 상태 동기화 완료 - isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[authStore] 게임 상태 동기화 중 오류:', error)
          // 오류 시 게임 상태 초기화
          set({ gameInfo: initialGameInfo })
        }
      },

      // 방 생성 후 게임 참여 (상태 업데이트 + 게임 시작 API 호출)
      joinGame: async (roomId, isCreator) => {
        try {
          // 1. 상태를 먼저 업데이트
          set({
            gameInfo: {
              isInGame: true,
              roomId,
              isCreator,
            },
          })

          // 2. 게임 시작 API 호출
          await postRequest(`/room/${roomId}/start`)
          
          console.log(`[authStore] 게임 참여 완료 - roomId: ${roomId}, isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[authStore] 게임 참여 중 오류:', error)
          // API 실패 시 상태 롤백
          set({ gameInfo: initialGameInfo })
          throw error // 호출자에게 에러 전파
        }
      },

      // 대기실에서 게임 시작 (기존 참여자가 게임을 시작할 때)
      startGame: async (roomId) => {
        try {
          // 먼저 방장 여부 확인
          const isCreator = await get().checkCreatorStatus()
          if (!isCreator) {
            throw new Error('방장만 게임을 시작할 수 있습니다.')
          }

          await postRequest(`/room/${roomId}/start`)
          
          console.log(`[authStore] 게임 시작 완료 - roomId: ${roomId}`)
        } catch (error) {
          console.error('[authStore] 게임 시작 중 오류:', error)
          throw error // 호출자에게 에러 전파
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
          
          // rehydration 후 게임 상태 동기화
          setTimeout(() => {
            state?.syncGameState()
          }, 100)
        }
      },
    },
  ),
)