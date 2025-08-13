/**
 * src/stores/auth.ts
 * 정리된 인증 및 게임 상태 관리 Zustand 스토어
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
  user: User
  gameInfo: GameInfo
  isReady: boolean
  isAuthenticated: boolean
  
  handleLoginSuccess: () => boolean
  setUser: (u: User) => void
  setGameInfo: (info: Partial<GameInfo>) => void
  joinGame: (roomId: number, isCreator: boolean) => Promise<void>
  startGame: (roomId: number) => Promise<void>
  checkCreatorStatus: () => Promise<boolean>
  syncGameState: () => Promise<void>
  leaveGame: () => Promise<void>
  finishGame: () => void
  logout: () => Promise<void>
  markReady: () => void
  // 서버 상태 전체 동기화 (인증 + 게임)
  syncAllFromServer: () => Promise<void>
  // 서버에서 사용자 상태 동기화 (인증만)
  bootstrapFromServer: () => Promise<void>
  syncUserGameStatus: () => Promise<GameStatus>
  setGameStatus: (status: GameStatus, roomId?: number) => void
}

const INITIAL_GAME_INFO: GameInfo = {
  status: 'IN_NONE',
  roomId: null,
  isCreator: false,
}

const INITIAL_STATE = {
  user: null,
  gameInfo: INITIAL_GAME_INFO,
  isAuthenticated: false,
  isReady: false
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      ...INITIAL_STATE,

     handleLoginSuccess: () => {
        const redirectDataStr = localStorage.getItem('redirectAfterLogin');
        
        if (redirectDataStr) {
          try {
            const redirectData = JSON.parse(redirectDataStr);
            console.log('[AUTH] 로그인 성공 - 리다이렉트 데이터:', redirectData);
            
            localStorage.removeItem('redirectAfterLogin');
            
            const isValid = Date.now() - redirectData.timestamp < 24 * 60 * 60 * 1000;
            
            if (isValid && redirectData.url) {
              console.log('[AUTH] 원래 페이지로 리다이렉트:', redirectData.url);
              setTimeout(() => {
                window.location.href = redirectData.url;
              }, 500);
              return true;
            } else {
              // 🔥 추가: 데이터가 유효하지 않은 경우
              console.log('[AUTH] 리다이렉트 데이터 만료/무효 - 메인으로 이동');
            }
          } catch (error) {
            console.error('[AUTH] 리다이렉트 데이터 파싱 실패:', error);
            localStorage.removeItem('redirectAfterLogin');
            // 🔥 추가: 에러 시에도 메인으로 가야 함
            console.log('[AUTH] 파싱 오류 - 메인으로 이동');
          }
        }
        
        // 🔥 수정: 모든 "메인으로 가야 하는" 경우들이 여기로 도달
        console.log('[AUTH] 리다이렉트 정보 없음/오류 - 메인으로 이동');
        setTimeout(() => {
          window.location.href = '/main';
        }, 500);
        return true;
      },


      // 사용자 게임 상태 동기화
      syncUserGameStatus: async () => {
        try {
          const { isAuthenticated } = get();
          if (!isAuthenticated) {
            set({ gameInfo: { ...INITIAL_GAME_INFO } });
            return 'IN_NONE';
          }

          const status = await getRequest<GameStatus>('/room/check');
          
          // 대기 중이면 방 정보도 가져오기
          let roomId = null;
          if (status !== 'IN_NONE') {
            try {
              roomId = await getRequest<number>('/room/roomId');
            } catch (error) {
              console.warn('현재 방 ID 조회 실패:', error);
            }
          }

          set({ 
            gameInfo: { 
              status, 
              roomId, 
              isCreator: get().gameInfo.isCreator 
            } 
          });
          return status;
        } catch (error) {
          console.error('[authStore] 게임 상태 확인 실패:', error);
          set({ gameInfo: { ...INITIAL_GAME_INFO } });
          return 'IN_NONE';
        }
      },

      // 게임 상태 직접 설정
      setGameStatus: (status, roomId) => {
        set({ 
          gameInfo: { 
            status, 
            roomId: roomId || null,
            isCreator: get().gameInfo.isCreator
          } 
        });
      },

      setUser: (user) => set({ user }),

      // 게임 정보 부분 업데이트
      setGameInfo: (info) => set((state) => ({
        gameInfo: { ...state.gameInfo, ...info }
      })),

      // 서버 상태 전체 동기화 (인증 + 게임 상태)
      syncAllFromServer: async () => {
        try {
          const wasNotAuthenticated = !get().isAuthenticated
          
          // 1. 인증 상태 확인
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          
          // 2. 게임 상태 동기화
          await get().syncUserGameStatus()
          
          // 3. 새 로그인 시 리다이렉트 처리
          if (wasNotAuthenticated) {
            console.log('[AUTH] 새 로그인 감지');
            const hasRedirect = get().handleLoginSuccess();
            if (!hasRedirect) {
              console.log('[AUTH] 리다이렉트 없음 - 기본 동작 유지');
            }
          }
          
          console.log('[AUTH] 전체 상태 동기화 완료')
        } catch (error) {
          console.log('[AUTH] 미로그인 상태 확인됨')
          set({
            user: null,
            isAuthenticated: false,
            gameInfo: INITIAL_GAME_INFO,
          })
        } finally {
          get().markReady()
        }
      },
      // 서버에서 인증 상태만 동기화 (기존 함수)
      bootstrapFromServer: async () => {
        try {
          const wasNotAuthenticated = !get().isAuthenticated
          
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          
          // 새 로그인 감지 시 리다이렉트 처리
          if (wasNotAuthenticated) {
            console.log('[AUTH] 새 로그인 감지');
            const hasRedirect = get().handleLoginSuccess();
            if (!hasRedirect) {
              console.log('[AUTH] 리다이렉트 없음 - 기본 동작 유지');
            }
          }
          
          console.log('[AUTH] 서버 인증 상태 동기화 완료')
        } catch (error) {
          console.log('[AUTH] 미로그인 상태 확인됨')
          set({
            user: null,
            isAuthenticated: false,
            gameInfo: INITIAL_GAME_INFO,
          })
        } finally {
          get().markReady()
        }
      },

      // 현재 사용자가 방장인지 서버에서 확인
      checkCreatorStatus: async () => {
        try {
          const { isAuthenticated } = get()
          if (!isAuthenticated) {
            console.warn('[AUTH] 미로그인 상태에서 방장 여부 확인 시도')
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
          console.error('[AUTH] 방장 여부 확인 중 오류:', error)
          // API 오류 시 게임 상태 초기화
          set({ gameInfo: INITIAL_GAME_INFO })
          return false
        }
      },

      // 게임 상태 전체 동기화
      syncGameState: async () => {
        try {
          const { isAuthenticated, gameInfo } = get()
          
          // 로그인 상태가 아니거나 게임 중이 아니면 스킵
          if (!isAuthenticated || gameInfo.status === 'IN_NONE') {
            console.log('[AUTH] 게임 상태 동기화 스킵 (조건 미충족)')
            return
          }

          // 게임 상태 동기화
          await get().syncUserGameStatus()

          // 방장 여부 확인 및 동기화
          const isCreator = await get().checkCreatorStatus()
          
          console.log(`[AUTH] 게임 상태 동기화 완료 - roomId: ${gameInfo.roomId}, isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[AUTH] 게임 상태 동기화 중 오류:', error)
          // 오류 시 게임 상태 초기화
          set({ gameInfo: INITIAL_GAME_INFO })
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
              status: 'IN_GAME',
              roomId,
              isCreator,
            },
          })

          // 2. 게임 시작 API 호출 (방 생성자만)
          if (isCreator) {
            await postRequest(`/room/${roomId}/start`)
          }
          
          console.log(`[AUTH] 게임 참여 완료 - roomId: ${roomId}, isCreator: ${isCreator}`)
        } catch (error) {
          console.error('[AUTH] 게임 참여 중 오류:', error)
          // API 실패 시 상태 롤백
          set({ gameInfo: INITIAL_GAME_INFO })
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
          
          console.log(`[AUTH] 게임 시작 완료 - roomId: ${roomId}`)
        } catch (error) {
          console.error('[AUTH] 게임 시작 중 오류:', error)
          throw error
        }
      },

      // 게임에서 나가기
      leaveGame: async () => {
        try {
          const { gameInfo, isAuthenticated } = get()
          
          if (isAuthenticated && gameInfo.roomId) {
            // 서버에 나가기 알림
            await postRequest(`/room/${gameInfo.roomId}/leave`).catch(err => {
              console.warn('[AUTH] 게임 나가기 API 실패:', err)
            })
          }
        } catch (error) {
          console.error('[AUTH] 게임 나가기 중 오류:', error)
        } finally {
          // 상태는 항상 초기화
          set({ gameInfo: INITIAL_GAME_INFO })
          console.log('[AUTH] 게임 나가기 완료')
        }
      },

      finishGame: () => {
        set({ gameInfo: INITIAL_GAME_INFO })
        console.log('[AUTH] 게임 종료')
      },

      // 로그아웃
      logout: async () => {
        try {
          await api.post('/auth/logout')
          console.log('[AUTH] 서버 로그아웃 완료')
        } catch (error) {
          console.error('[AUTH] 서버 로그아웃 실패:', error)
        } finally {
          // 클라이언트 상태 정리
          set({
            user: null,
            gameInfo: INITIAL_GAME_INFO,
            isAuthenticated: false,
          })
          
          localStorage.removeItem('auth')
          console.log('[AUTH] 클라이언트 로그아웃 완료')
        }
      },
    
      markReady: () => set({ isReady: true }),
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