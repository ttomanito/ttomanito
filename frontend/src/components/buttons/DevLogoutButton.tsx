// src/components/buttons/DevLogoutButton.tsx
import React from 'react'
import { Button } from '@chakra-ui/react'
import { useAuth } from '@/stores/authStore'      // 실제 위치로 조정

const DevLogoutButton: React.FC = () => {
  const logout        = useAuth(s => s.logout)
  const isAuthed      = useAuth(s => s.isAuthenticated)
  const hydrated      = useAuth(s => s.hydrated)     // 재수화 완료 여부
  const isDev         = import.meta.env.DEV          // Vite 개발 모드 체크
  console.log('🌴 useAuth.getState()', useAuth.getState())
  console.log('🌴 selector tokens', useAuth(s => s.tokens))
  console.log('🌴 selector user',   useAuth(s => s.user))
  console.log('🌴 get isAuthenticated', useAuth(s => s.isAuthenticated))
  console.log('🌴 get hydrated',       useAuth(s => s.hydrated))
  console.log('🌴 import.meta.env.DEV', import.meta.env.DEV)
  console.log('DevLogoutButton', { isDev, hydrated, isAuthed })

  // 개발 모드 + 재수화 끝 + 로그인 상태일 때만 렌더
  if (!isDev || !hydrated || !isAuthed) return null

  return (
    <Button
      position="absolute"
      top="4"
      left="50%"
      transform="translateX(-50%)"
      zIndex="tooltip"
      colorScheme="red"
      size="sm"
      onClick={logout}
    >
     개발용 로그아웃
    </Button>
  )
}

export default DevLogoutButton
