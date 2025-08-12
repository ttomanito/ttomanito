/**
 * src/stores/auth.ts
 * ✅ 인증 및 게임 상태를 관리하는 Zustand 스토어 (개선된 버전)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getRequest, postRequest } from '@/api/requests'
import { api } from '@/api/client.ts'

type User = { id: string; name: string; } | null
type UserGameStatus = 'IN_NONE' | 'IN_WAITING' | 'IN_GAME';
type GameInfo = {
  isInGame: boolean
  roomId: number | null
  isCreator: boolean
}

type AuthState = {
  user: User
  gameInfo: GameInfo
  hydrated: boolean
  isAuthenticated: boolean // ★ 서버 기준 로그인 상태
  userGameStatus: UserGameStatus;
  currentRoomId: number | null;
  
  handleLoginSuccess: () => boolean; // 🔥 추가
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
  checkUserGameStatus: () => Promise<UserGameStatus>;
  setUserGameStatus: (status: UserGameStatus, roomId?: number) => void;
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
      gameInfo: initialGameInfo,
      hydrated: false,
      isAuthenticated: false,
      userGameStatus: 'IN_NONE',
      currentRoomId: null,

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
            }
          } catch (error) {
            console.error('[AUTH] 리다이렉트 데이터 파싱 실패:', error);
            localStorage.removeItem('redirectAfterLogin');
          }
        }
        
        return false;
      },

      // 사용자 게임 상태 확인
      checkUserGameStatus: async () => {
        try {
          const { isAuthenticated } = get();
          if (!isAuthenticated) {
            set({ userGameStatus: 'IN_NONE', currentRoomId: null });
            return 'IN_NONE';
          }

          const status = await getRequest<UserGameStatus>('/room/check');
          
          // 대기 중이면 방 정보도 가져오기
          let roomId = null;
          if (status === 'IN_WAITING') {
            try {
              roomId = await getRequest<number>('/room/roomId'); // 🔥 간단해짐!
            } catch (error) {
              console.warn('현재 방 ID 조회 실패:', error);
            }
          }

          set({ userGameStatus: status, currentRoomId: roomId });
          return status;
        } catch (error) {
          console.error('[authStore] 게임 상태 확인 실패:', error);
          set({ userGameStatus: 'IN_NONE', currentRoomId: null });
          return 'IN_NONE';
        }
      },

      // 상태 직접 설정
      setUserGameStatus: (status, roomId) => {
        set({ 
          userGameStatus: status, 
          currentRoomId: roomId || null 
        });
      },

      setUser: (user) => set({ user }),

      // 게임 정보 부분 업데이트
      setGameInfo: (info) => set((state) => ({
        gameInfo: { ...state.gameInfo, ...info }
      })),

      // ★ 서버에서 사용자 상태 동기화 (HttpOnly 쿠키 기반)
      bootstrapFromServer: async () => {
        try {
          const wasNotAuthenticated = !get().isAuthenticated // 🔥 추가: 이전 인증 상태 저장
          
          const { data } = await api.get('/auth/me')
          set({
            user: { id: String(data.userId), name: data.name },
            isAuthenticated: true,
          })
          
          // 🔥 추가: 새 로그인 감지 시 리다이렉트 처리
          if (wasNotAuthenticated) {
            console.log('[AUTH] 새 로그인 감지');
            const hasRedirect = get().handleLoginSuccess();
            if (!hasRedirect) {
              console.log('[AUTH] 리다이렉트 없음 - 기본 동작 유지');
            }
          }
          
          console.log('[authStore] 서버 인증 상태 동기화 완료')
        } catch (error) {
          console.log('[authStore] 미로그인 상태 확인됨')
          set({
            user: null,
            isAuthenticated: false,
            gameInfo: initialGameInfo,
            userGameStatus: 'IN_NONE',
            currentRoomId: null,
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
        try {
          // 🔥 서버 로그아웃 API 호출 추가
          await api.post('/auth/logout') // 또는 적절한 로그아웃 엔드포인트
          console.log('[authStore] 서버 로그아웃 완료')
        } catch (error) {
          console.error('[authStore] 서버 로그아웃 실패:', error)
          // 서버 로그아웃 실패해도 클라이언트 상태는 정리
        } finally {
          // 클라이언트 상태 정리
          set({
            user: null,
            gameInfo: initialGameInfo,
            isAuthenticated: false,
            userGameStatus: 'IN_NONE',
            currentRoomId: null,
          })
          
          localStorage.removeItem('auth')
          console.log('[authStore] 클라이언트 로그아웃 완료')
        }
      },
    
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        gameInfo: s.gameInfo,
        isAuthenticated: s.isAuthenticated,
        userGameStatus: s.userGameStatus, // 🔥 추가
        currentRoomId: s.currentRoomId, // 🔥 추가
      }),
onRehydrateStorage: () => {
  return (state, error) => {
    if (error) {
      console.error('[authStore] rehydration error:', error)
      return
    }
    
    // 🔥 localStorage에서 로그인 상태 확인
    const wasAuthenticated = state?.isAuthenticated;
    
    if (wasAuthenticated) {
      // 로그인 상태였을 때만 서버 확인
      state?.bootstrapFromServer?.().then(() => {
        setTimeout(() => {
          state?.syncGameState()
        }, 100)
      }).catch(err => {
        console.error('[authStore] 부트스트랩 실패:', err)
        state?.markHydrated?.()
      })
    } else {
      // 미로그인 상태면 바로 hydrated 처리
      console.log('[authStore] 미로그인 상태 - 서버 호출 스킵')
      state?.markHydrated?.()
    }
  }
},
    },
  ),
)