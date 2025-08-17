import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { deleteRequest, getRequest, postRequest } from '@/api/requests'
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
// const backendBase = (() => {
//   try {
//     const b = api?.defaults?.baseURL ?? ''
//     return b.endsWith('/') ? b.slice(0, -1) : b
//   } catch {
//     return ''
//   }
// })()
const backendOrigin =
  import.meta.env.VITE_BASE_URL ||
  new URL(api?.defaults?.baseURL ?? '', window.location.origin).origin;

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
          let isCreator = false

          if (status !== 'IN_NONE') {
            try {
              const [roomIdResponse, creatorResponse] = await Promise.allSettled([
                getRequest<number>('/room/roomId'),
                getRequest('/room/creator')
              ])

              if (roomIdResponse.status === 'fulfilled') {
                roomId = roomIdResponse.value
              }
              if (creatorResponse.status === 'fulfilled') {
                isCreator = creatorResponse.value === true || creatorResponse.value === 'true'
              }
            } catch {
              // 방 정보 조회 실패 시 무시
            }
          }

          set({
            gameInfo: {
              status,
              roomId,
              isCreator,
            },
          })
          return status
        } catch {
          set({ gameInfo: { ...INITIAL_GAME_INFO } })
          return 'IN_NONE'
        }
      },

      syncAllFromServer: async () => {
        const { authSyncPaused } = get()
        if (authSyncPaused) return
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
        } catch {
          set({ user: null, isAuthenticated: false, gameInfo: INITIAL_GAME_INFO })
        } finally {
          get().markReady()
        }
      },

      bootstrapFromServer: async () => {
        const { authSyncPaused } = get()
        if (authSyncPaused) return
        try {
          const wasNotAuthenticated = !get().isAuthenticated
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          get().resumeAuthSync()
          if (wasNotAuthenticated) get().handleLoginSuccess()
        } catch {
          set({ user: null, isAuthenticated: false, gameInfo: INITIAL_GAME_INFO })
        } finally {
          get().markReady()
        }
      },


      checkCreatorStatus: async () => {
        await get().syncUserGameStatus()
        return get().gameInfo.isCreator
      },

      syncGameState: async () => {
        try {
          const { isAuthenticated, gameInfo } = get()
          if (!isAuthenticated || gameInfo.status === 'IN_NONE') return
          await get().syncUserGameStatus()
          await get().checkCreatorStatus()
        } catch {
          set({ gameInfo: INITIAL_GAME_INFO })
        }
      },

      joinGame: async (roomId, isCreator) => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) throw new Error('로그인이 필요합니다.')
          set({ gameInfo: { status: 'IN_GAME', roomId, isCreator } })
          if (isCreator) await postRequest(`/room/${roomId}/start`)
        } catch (e) {
          set({ gameInfo: INITIAL_GAME_INFO })
          throw e
        }
      },

      startGame: async (roomId) => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) throw new Error('로그인이 필요합니다.')
        await postRequest(`/room/${roomId}/start`)
      },

      leaveGame: async () => {
        try {
          const { gameInfo, isAuthenticated } = get()
          if (isAuthenticated && gameInfo.roomId) {
            await postRequest(`/room/${gameInfo.roomId}/leave`).catch(() => {})
          }
        } finally {
          set({ gameInfo: INITIAL_GAME_INFO })
        }
      },

      finishGame: () => {
        set({ gameInfo: INITIAL_GAME_INFO })
      },

      // ---------- logout ----------
      logoutAppOnly: async () => {
        try {
          get().pauseAuthSync()
          await postRequest('/auth/logout')
          await deleteRequest('/push/token')
        } finally {
          set({ user: null, gameInfo: INITIAL_GAME_INFO, isAuthenticated: false })
          localStorage.removeItem('auth')
          window.location.replace('/login')
        }
      },

      // logoutViaKakaoPage: async () => {
      //   try {
      //     get().pauseAuthSync()
      //     set({ user: null, gameInfo: INITIAL_GAME_INFO, isAuthenticated: false })
      //     localStorage.removeItem('auth')
      //   } finally {
      //     const url = (backendBase ? `${backendBase}` : '') + '/auth/kakao/logout-page'
      //     window.location.href = url
      //   } 
      // },

      logoutViaKakaoPage: async () => {
        try {
          get().pauseAuthSync()
          set({ user: null, gameInfo: INITIAL_GAME_INFO, isAuthenticated: false })
          localStorage.removeItem('auth')
        } finally {
          window.location.assign(`${backendOrigin}/auth/kakao/logout-page`);
        }
      },

      logout: async () => {
        await get().logoutViaKakaoPage()
      },
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        gameInfo: s.gameInfo,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
)
