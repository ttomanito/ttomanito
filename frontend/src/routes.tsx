// src/routes.tsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
// (옵션) 바텀 없는 레이아웃
const NoBottomLayout = React.lazy(() => import("@/components/layout/NoBottomLayout"))
const BasicLayout = React.lazy(() => import("@/components/layout/BasicLayout"))
// ===== lazy pages =====
const MainPage         = React.lazy(() => import("@/pages/MainPage"))
const LoginPage        = React.lazy(() => import("@/pages/Auth/LoginPage"))
const SignupPage       = React.lazy(() => import("@/pages/Auth/SignupPage"))
const GroupCreatePage  = React.lazy(() => import("@/pages/GroupCreatePage"))
const WaitingRoomPage  = React.lazy(() => import("@/pages/Group/WaitingRoomPage"))
const HomePage         = React.lazy(() => import("@/pages/HomePage"))
const ChatListPage     = React.lazy(() => import("@/pages/Chat/ChatListPage"))
const ChatRoomPage     = React.lazy(() => import("@/pages/Chat/ChatRoomPage"))
const CallPage         = React.lazy(() => import("@/pages/Chat/CallPage"))
const GuessPage        = React.lazy(() => import("@/pages/GuessPage"))
const RankingPage      = React.lazy(() => import("@/pages/RankingPage"))
const ProfilePage      = React.lazy(() => import("@/pages/ProfilePage"))
const ReportListPage   = React.lazy(() => import("@/pages/Report/ReportListPage"))
const ReportDetailPage = React.lazy(() => import("@/pages/Report/ReportDetailPage"))

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== 위아래 없는 기본 레이아웃 ===== */}
      <Route element={<BasicLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/group-create"   element={<GroupCreatePage />} />
        <Route path="/auth/login"  element={<LoginPage />} />
        <Route path="/group/:groupId" element={<WaitingRoomPage />} />
      </Route>
      {/* ===== 바텀 없는 인증 레이아웃 ===== */}
      <Route element={<NoBottomLayout />}>
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/chat/:chatRoomId/call" element={<CallPage />} />
      </Route>

      {/* ===== 공통 헤더(메인 레이아웃) ===== */}
      <Route element={<MainLayout />}>
        {/* 홈 */}
        <Route path="/home"   element={<HomePage />} />

        {/* 그룹(방) */}
        


        {/* 채팅 */}
        <Route path="/chat"               element={<ChatListPage />} />
        <Route path="/chat/:chatRoomId"   element={<ChatRoomPage />} />

        {/* 게임 기능 */}
        <Route path="/guess"   element={<GuessPage />} />
        <Route path="/ranking" element={<RankingPage />} />

        {/* 프로필 & 리포트 */}
        <Route path="/profile"          element={<ProfilePage />} />
        <Route path="/report"           element={<ReportListPage />} />
        <Route path="/report/:reportId" element={<ReportDetailPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<p>페이지를 찾을 수 없습니다.</p>} />
    </Routes>
  )
}
