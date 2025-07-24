// src/routes.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

// ===== lazy pages =====
const MainPage         = React.lazy(() => import('@/pages/MainPage'))
const LoginPage        = React.lazy(() => import('@/pages/Auth/LoginPage'))
const SignupPage       = React.lazy(() => import('@/pages/Auth/SignupPage'))

const GroupCreatePage  = React.lazy(() => import('@/pages/GroupCreatePage'))
const WaitingRoomPage  = React.lazy(() => import('@/pages/Group/WaitingRoomPage'))


const HomePage         = React.lazy(() => import('@/pages/HomePage'))


const ChatListPage     = React.lazy(() => import('@/pages/Chat/ChatListPage'))
const ChatRoomPage     = React.lazy(() => import('@/pages/Chat/ChatRoomPage'))
const CallPage         = React.lazy(() => import('@/pages/Chat/CallPage'))

const GuessPage        = React.lazy(() => import('@/pages/GuessPage'))
const RankingPage      = React.lazy(() => import('@/pages/RankingPage'))

const ProfilePage      = React.lazy(() => import('@/pages/ProfilePage'))
const ReportListPage   = React.lazy(() => import('@/pages/Report/ReportListPage'))
const ReportDetailPage = React.lazy(() => import('@/pages/Report/ReportDetailPage'))

export default function AppRoutes() {
  return (
    <Routes>
      {/* 메인 & 인증 */}
      <Route path="/"           element={<MainPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />

      {/* 그룹(방) */}
      <Route path="/group-create"          element={<GroupCreatePage />} />
      <Route path="/group/:groupId"        element={<WaitingRoomPage />} />


      {/* 게임 홈*/}
      <Route path="/home"     element={<HomePage />} />


      {/* 채팅 */}
      <Route path="/chat"                     element={<ChatListPage />} />
      <Route path="/chat/:chatRoomId"         element={<ChatRoomPage />} />
      <Route path="/chat/:chatRoomId/call"    element={<CallPage />} />

      {/* 게임 기능 */}
      <Route path="/guess"   element={<GuessPage />} />
      <Route path="/ranking" element={<RankingPage />} />

      {/* 프로필 & 리포트 */}
      <Route path="/profile"          element={<ProfilePage />} />
      <Route path="/report"           element={<ReportListPage />} />
      <Route path="/report/:reportId" element={<ReportDetailPage />} />

      {/* 404 */}
      <Route path="*" element={<p>페이지를 찾을 수 없습니다.</p>} />
    </Routes>
  )
}
