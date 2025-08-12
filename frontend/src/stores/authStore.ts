/**
 * src/stores/auth.ts
 * ✅ 인증 및 게임 상태를 관리하는 Zustand 스토어 (개선된 버전)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { postRequest } from '@/api/requests'
import { api } from '@/api/client.ts'

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
  isAuthenticated: boolean // ★ 서버 기준 로그인 상태

  setTokens: (t: Tokens) => void
  setUser: (u: User) => void
  setGameInfo: (info: Partial<GameInfo>) => void
  joinGame: (roomId: number, isCreator: boolean) => Promise<void>
  startGame: (roomId: number) => Promise<void>
  checkCreatorStatus: () => Promise<boolean>
  syncGameState: () => Promise<void>
  leaveGame: () => Promise<void>
  finishGame: () => void
  logout: () => Promise<void> // ★ 서버 로그아웃 추가
  markHydrated: () => void
  bootstrapFromServer: () => Promise<void> // ★ 서버 상태 동기화
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
      isAuthenticated: false,

      setTokens: (tokens) => {
        // 토큰 쿠키에 저장 (dev 환경용)
        if (tokens.accessToken) {
          Cookies.set('accessToken', tokens.accessToken)
        } else {
          Cookies.remove('accessToken')
        }
        if (tokens.refreshToken) {
          Cookies.set('refreshToken', tokens.refreshToken)
        } else {
          Cookies.remove('refreshToken')
        }
        
        set({ 
          tokens,
          // 토큰만으로는 로그인 판정하지 않음 (서버 확인 필요)
          isAuthenticated: !!tokens.accessToken 
        })
      },

      setUser: (user) => set({ user }),

      // 게임 정보 부분 업데이트
      setGameInfo: (info) => set((state) => ({
        gameInfo: { ...state.gameInfo, ...info }
      })),

      // ★ 서버에서 사용자 상태 동기화 (HttpOnly 쿠키 기반)
      bootstrapFromServer: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          console.log('[authStore] 서버 인증 상태 동기화 완료')
        } catch (error) {
          console.log('[authStore] 미로그인 상태 확인됨')
          set({
            user: null,
            isAuthenticated: false,
            gameInfo: initialGameInfo, // ★ 미로그인 시 게임 상태도 초기화
          })
        } finally {
          get().markHydrated()
        }
      },

      // 현재 사용자가 방장인지 서버에서 확인
      checkCreatorStatus: async () => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            console.warn('[authStore] 미로그인 상태에서 방장 여부 확인 시도')
            return false
          }

          const response = await postRequest('/room/creator')
          const isCreator = response === true || response === 'true'
          
          // 상태 업데이트 (현재 상태와 다를 때만)
          const currentState = get()
          if (currentState.gameInfo.isCreator !== isCreator) {
            set((state) => ({
              gameInfo: { ...state.gameInfo, isCreator }
            }))
          }
          
          return isCreator
        } catch (error) {
          console.error('[authStore] 방장 여부 확인 중 오류:', error)
          // ★ API 오류 시 게임 상태 초기화
          set({ gameInfo: initialGameInfo })
          return false
        }
      },

      // 게임 상태 전체 동기화 (페이지 새로고침 후 등)
      syncGameState: async () => {
        try {
          const { isAuthenticated, gameInfo } = get()
          
          // 로그인 상태가 아니거나 게임 중이 아니면 스킵
          if (!isAuthenticated || !gameInfo.isInGame || !gameInfo.roomId) {
            console.log('[authStore] 게임 상태 동기화 스킵 (조건 미충족)')
            return
          }

          // 방장 여부 확인 및 동기화
          const isCreator = await get().checkCreatorStatus()
          
          console.log(`[authStore] 게임 상태 동기화 완료 - roomId: ${gameInfo.roomId}, isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[authStore] 게임 상태 동기화 중 오류:', error)
          // 오류 시 게임 상태 초기화
          set({ gameInfo: initialGameInfo })
        }
      },

      // 방 생성 후 게임 참여
      joinGame: async (roomId, isCreator) => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            throw new Error('로그인이 필요합니다.')
          }

          // 1. 상태를 먼저 업데이트
          set({
            gameInfo: {
              isInGame: true, 
              roomId,
              isCreator,
            },
          })

          // 2. 게임 시작 API 호출 (방 생성자만)
          if (isCreator) {
            await postRequest(`/room/${roomId}/start`)
          }
          
          console.log(`[authStore] 게임 참여 완료 - roomId: ${roomId}, isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[authStore] 게임 참여 중 오류:', error)
          // API 실패 시 상태 롤백
          set({ gameInfo: initialGameInfo })
          throw error
        }
      },

      // 대기실에서 게임 시작
      startGame: async (roomId) => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            throw new Error('로그인이 필요합니다.')
          }

          // 방장 여부 확인
          const isCreator = await get().checkCreatorStatus()
          if (!isCreator) {
            throw new Error('방장만 게임을 시작할 수 있습니다.')
          }

          await postRequest(`/room/${roomId}/start`)
          
          console.log(`[authStore] 게임 시작 완료 - roomId: ${roomId}`)
        } catch (error) {
          console.error('[authStore] 게임 시작 중 오류:', error)
          throw error
        }
      },

      // ★ 게임에서 나가기 (서버에도 알림)
      leaveGame: async () => {
        try {
          const { gameInfo, isAuthenticated } = get()
          
          if (isAuthenticated && gameInfo.roomId) {
            // 서버에 나가기 알림
            await postRequest(`/room/${gameInfo.roomId}/leave`).catch(err => {
              console.warn('[authStore] 게임 나가기 API 실패:', err)
            })
          }
        } catch (error) {
          console.error('[authStore] 게임 나가기 중 오류:', error)
        } finally {
          // 상태는 항상 초기화
          set({ gameInfo: initialGameInfo })
          console.log('[authStore] 게임 나가기 완료')
        }
      },

      finishGame: () => {
        set({ gameInfo: initialGameInfo })
        console.log('[authStore] 게임 종료')
      },

      // ★ 로그아웃 (서버 + 클라이언트)
      logout: async () => {
          set({
            user: null,
            tokens: { accessToken: null, refreshToken: null },
            gameInfo: initialGameInfo,
            isAuthenticated: false,
          })
          
          // 저장소 정리
          localStorage.removeItem('auth')
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
          
          console.log('[authStore] 로그아웃 완료')
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
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[authStore] rehydration error:', error)
            return
          }
          
          // ★ 서버 상태 동기화 우선 (bootstrapFromServer → syncGameState)
          state?.bootstrapFromServer?.().then(() => {
            // 인증 확인 후 게임 상태 동기화
            setTimeout(() => {
              state?.syncGameState()
            }, 100)
          }).catch(err => {
            console.error('[authStore] 부트스트랩 실패:', err)
            state?.markHydrated?.() // 실패해도 hydrated는 표시
          })
        }
      },
    },
  ),
)