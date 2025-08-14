/**
 * src/stores/auth.ts
 * 인증 + 게임 상태(Zustand)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getRequest, postRequest } from '@/api/requests'
import { api } from '@/api/client.ts'

type User = {
  id: string
  name: string
} | null

type GameStatus = 'IN_NONE' | 'IN_WAITING' | 'IN_GAME'

type GameInfo = {
  status: GameStatus
  roomId: number | null
  isCreator: boolean
}

type AuthState = {
  // state
  user: User
  gameInfo: GameInfo
  isReady: boolean
  isAuthenticated: boolean
  authSyncPaused: boolean

  // actions
  handleLoginSuccess: () => boolean
  setUser: (u: User) => void
  setGameInfo: (info: Partial<GameInfo>) => void
  setGameStatus: (status: GameStatus, roomId?: number | null) => void
  markReady: () => void

  // server sync
  syncAllFromServer: () => Promise<void>
  bootstrapFromServer: () => Promise<void>
  syncUserGameStatus: () => Promise<GameStatus>
  checkCreatorStatus: () => Promise<boolean>
  syncGameState: () => Promise<void>

  // game flow
  joinGame: (roomId: number, isCreator: boolean) => Promise<void>
  startGame: (roomId: number) => Promise<void>
  leaveGame: () => Promise<void>
  finishGame: () => void

  // logout
  logout: () => Promise<void>               // 기본: 카카오 로그아웃 페이지로 이동
  logoutAppOnly: () => Promise<void>        // 서비스만 로그아웃 (XHR)
  logoutViaKakaoPage: () => Promise<void>   // 카카오 로그아웃 페이지로 이동

  // auth sync on/off
  pauseAuthSync: () => void
  resumeAuthSync: () => void
}

const INITIAL_GAME_INFO: GameInfo = {
  status: 'IN_NONE',
  roomId: null,
  isCreator: false,
}

const INITIAL_STATE = {
  user: null as User,
  gameInfo: INITIAL_GAME_INFO,
  isAuthenticated: false,
  isReady: false,
  authSyncPaused: false,
}

// 백엔드 베이스 URL (카카오 로그아웃 페이지로 이동할 때 필요)
const backendBase = (() => {
  try {
    const b = api?.defaults?.baseURL ?? ''
    return b.endsWith('/') ? b.slice(0, -1) : b
  } catch {
    return ''
  }
})()

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ---------- small setters ----------
      setUser: (user) => set({ user }),
      setGameInfo: (info) =>
        set((state) => ({ gameInfo: { ...state.gameInfo, ...info } })),
      setGameStatus: (status, roomId = null) =>
        set((state) => ({
          gameInfo: { status, roomId, isCreator: state.gameInfo.isCreator },
        })),
      markReady: () => set({ isReady: true }),

      pauseAuthSync: () => set({ authSyncPaused: true }),
      resumeAuthSync: () => set({ authSyncPaused: false }),

      // ---------- after login redirect ----------
      handleLoginSuccess: () => {
        const redirectDataStr = localStorage.getItem('redirectAfterLogin')
        if (redirectDataStr) {
          try {
            const redirectData = JSON.parse(redirectDataStr)
            localStorage.removeItem('redirectAfterLogin')
            const isValid =
              Date.now() - redirectData.timestamp < 24 * 60 * 60 * 1000
            if (isValid && redirectData.url) {
              setTimeout(() => {
                window.location.href = redirectData.url
              }, 500)
              return true
            }
          } catch {
            localStorage.removeItem('redirectAfterLogin')
          }
        }
        setTimeout(() => {
          window.location.href = '/main'
        }, 500)
        return true
      },

      // ---------- server sync ----------
      syncUserGameStatus: async () => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            set({ gameInfo: { ...INITIAL_GAME_INFO } })
            return 'IN_NONE'
          }

          const status = await getRequest<GameStatus>('/room/check')

          let roomId: number | null = null
          if (status !== 'IN_NONE') {
            try {
              roomId = await getRequest<number>('/room/roomId')
            } catch (e) {
              console.warn('[AUTH] 현재 방 ID 조회 실패:', e)
            }
          }

          set({
            gameInfo: {
              status,
              roomId,
              isCreator: get().gameInfo.isCreator,
            },
          })
          return status
        } catch (e) {
          console.error('[AUTH] 게임 상태 확인 실패:', e)
          set({ gameInfo: { ...INITIAL_GAME_INFO } })
          return 'IN_NONE'
        }
      },

      syncAllFromServer: async () => {
        const { authSyncPaused } = get()
        if (authSyncPaused) {
          console.log('[AUTH] /auth/me 호출 스킵 (logout mode)')
          return
        }
        try {
          const wasNotAuthenticated = !get().isAuthenticated
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          get().resumeAuthSync()
          await get().syncUserGameStatus()
          if (wasNotAuthenticated) get().handleLoginSuccess()
          console.log('[AUTH] 전체 상태 동기화 완료')
        } catch {
          console.log('[AUTH] 미로그인 상태 확인됨')
          set({ user: null, isAuthenticated: false, gameInfo: INITIAL_GAME_INFO })
        } finally {
          get().markReady()
        }
      },

      bootstrapFromServer: async () => {
        const { authSyncPaused } = get()
        if (authSyncPaused) {
          console.log('[AUTH] /auth/me 호출 스킵 (logout mode)')
          return
        }
        try {
          const wasNotAuthenticated = !get().isAuthenticated
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          get().resumeAuthSync()
          if (wasNotAuthenticated) get().handleLoginSuccess()
          console.log('[AUTH] 서버 인증 상태 동기화 완료')
        } catch {
          console.log('[AUTH] 미로그인 상태 확인됨')
          set({ user: null, isAuthenticated: false, gameInfo: INITIAL_GAME_INFO })
        } finally {
          get().markReady()
        }
      },

      // ---------- game helpers ----------
      checkCreatorStatus: async () => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            console.warn('[AUTH] 미로그인 상태에서 방장 여부 확인 시도')
            return false
          }
          const response = await postRequest('/room/creator')
          const isCreator = response === true || response === 'true'
          const current = get().gameInfo.isCreator
          if (current !== isCreator) {
            set((state) => ({
              gameInfo: { ...state.gameInfo, isCreator },
            }))
          }
          return isCreator
        } catch (e) {
          console.error('[AUTH] 방장 여부 확인 중 오류:', e)
          set({ gameInfo: INITIAL_GAME_INFO })
          return false
        }
      },

      syncGameState: async () => {
        try {
          const { isAuthenticated, gameInfo } = get()
          if (!isAuthenticated || gameInfo.status === 'IN_NONE') {
            console.log('[AUTH] 게임 상태 동기화 스킵 (조건 미충족)')
            return
          }
          await get().syncUserGameStatus()
          const isCreator = await get().checkCreatorStatus()
          console.log(
            `[AUTH] 게임 상태 동기화 완료 - roomId: ${get().gameInfo.roomId}, isCreator: ${isCreator}`,
          )
        } catch (e) {
          console.error('[AUTH] 게임 상태 동기화 중 오류:', e)
          set({ gameInfo: INITIAL_GAME_INFO })
        }
      },

      joinGame: async (roomId, isCreator) => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) throw new Error('로그인이 필요합니다.')
          set({ gameInfo: { status: 'IN_GAME', roomId, isCreator } })
          if (isCreator) await postRequest(`/room/${roomId}/start`)
          console.log(
            `[AUTH] 게임 참여 완료 - roomId: ${roomId}, isCreator: ${isCreator}`,
          )
        } catch (e) {
          console.error('[AUTH] 게임 참여 중 오류:', e)
          set({ gameInfo: INITIAL_GAME_INFO })
          throw e
        }
      },

      startGame: async (roomId) => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) throw new Error('로그인이 필요합니다.')
          const isCreator = await get().checkCreatorStatus()
          if (!isCreator) throw new Error('방장만 게임을 시작할 수 있습니다.')
          await postRequest(`/room/${roomId}/start`)
          console.log(`[AUTH] 게임 시작 완료 - roomId: ${roomId}`)
        } catch (e) {
          console.error('[AUTH] 게임 시작 중 오류:', e)
          throw e
        }
      },

      leaveGame: async () => {
        try {
          const { gameInfo, isAuthenticated } = get()
          if (isAuthenticated && gameInfo.roomId) {
            await postRequest(`/room/${gameInfo.roomId}/leave`).catch((err) =>
              console.warn('[AUTH] 게임 나가기 API 실패:', err),
            )
          }
        } catch (e) {
          console.error('[AUTH] 게임 나가기 중 오류:', e)
        } finally {
          set({ gameInfo: INITIAL_GAME_INFO })
          console.log('[AUTH] 게임 나가기 완료')
        }
      },

      finishGame: () => {
        set({ gameInfo: INITIAL_GAME_INFO })
        console.log('[AUTH] 게임 종료')
      },

      // ---------- logout ----------
      /** 서비스만 로그아웃 (XHR, 204) */
      logoutAppOnly: async () => {
        try {
          get().pauseAuthSync()
          await postRequest('/auth/logout')
          console.log('[AUTH] 서버 로그아웃 완료')
        } catch (e) {
          console.error('[AUTH] 서버 로그아웃 실패:', e)
        } finally {
          set({ user: null, gameInfo: INITIAL_GAME_INFO, isAuthenticated: false })
          localStorage.removeItem('auth')
          console.log('[AUTH] 클라이언트 로그아웃 완료')
          window.location.replace('/login')
        }
      },

      /** 카카오 로그아웃 안내 페이지로 이동 (두 버튼 화면) */
      logoutViaKakaoPage: async () => {
        try {
          get().pauseAuthSync()
          set({ user: null, gameInfo: INITIAL_GAME_INFO, isAuthenticated: false })
          localStorage.removeItem('auth')
        } finally {
          const url =
            (backendBase ? `${backendBase}` : '') + '/auth/kakao/logout-page'
          // 전체 페이지 네비게이션 → 카카오 페이지 → (백엔드 콜백) → /login
          window.location.href = url
        }
      },

      /** 기본 로그아웃 동작: 카카오 페이지 띄우기 */
      logout: async () => {
        await get().logoutViaKakaoPage()
      },
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      // 굳이 pause 상태는 저장하지 않음
      partialize: (s) => ({
        user: s.user,
        gameInfo: s.gameInfo,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
)
