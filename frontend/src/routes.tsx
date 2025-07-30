// src/routes.tsx
import React from 'react';
import type { LazyExoticComponent, ComponentType, ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AppLayout from '@/components/layout/AppLayout';

// === lazy 로딩 타입 보조 함수 ===
function lazyImport<P = unknown>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  return React.lazy(factory);
}

// === Layouts ===
const NoBottomLayout = lazyImport(() => import('@/components/layout/NoBottomLayout'));
const BasicLayout = lazyImport(() => import('@/components/layout/BasicLayout'));

// === Pages ===
const MainPage = lazyImport(() => import('@/pages/MainPage')); // /
const SignupPage = lazyImport(() => import('@/pages/User/SignupPage')); // /user/login
const RoomCreatePage = lazyImport(() => import('@/pages/Room/RoomCreatePage')); // /room
// const WaitingRoomPage = lazyImport(() => import('@/pages/Room/WaitingRoomPage')); // /room/:roomId
const MatchingPage = lazyImport(() => import('@/pages/Room/MatchingPage')); // /manito/:roomId/matching
const HomePage = lazyImport(() => import('@/pages/HomePage')); // /home
const ChatListPage = lazyImport(() => import('@/pages/Chat/ChatListPage')); // /chat
const ChatRoomPage = lazyImport(() => import('@/pages/Chat/ChatRoomPage')); // /chat/:chatRoomId
const CallPage = lazyImport(() => import('@/pages/Chat/CallPage')); // /chat/:chatRoomId/call
const GuessPage = lazyImport(() => import('@/pages/Guess/GuessPage')); // /guess
const RankingPage = lazyImport(() => import('@/pages/RankingPage')); // /rank
const ProfilePage = lazyImport(() => import('@/pages/User/ProfilePage')); // /user/update
const ReportListPage = lazyImport(() => import('@/pages/Report/ReportListPage')); // /report/reportlist
const ReportDetailPage = lazyImport(() => import('@/pages/Report/ReportDetailPage')); // /report/reportdetail/:reportId

export default function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MainPage />} />
      </Route>
      {/* === 기본 레이아웃 === */}
      <Route element={<BasicLayout />}>
        <Route path="/room" element={<RoomCreatePage />} />
        <Route path="/user/register" element={<SignupPage />} />
        {/* <Route path="/room/:roomId" element={<WaitingRoomPage />} /> */}
        <Route path="/manito/:roomId/matching" element={<MatchingPage />} />
      </Route>

      {/* === 바텀 없는 인증/콜 전용 레이아웃 === */}
      <Route element={<NoBottomLayout />}>
        <Route path="/chat/:chatRoomId/call" element={<CallPage />} />
      </Route>

      {/* === 메인 기능 레이아웃 === */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:chatRoomId" element={<ChatRoomPage />} />
        <Route path="/guess" element={<GuessPage />} />
        <Route path="/rank" element={<RankingPage />} />
        <Route path="/user/update" element={<ProfilePage />} />
        <Route path="/report/reportlist" element={<ReportListPage />} />
        <Route path="/report/reportdetail/:reportId" element={<ReportDetailPage />} />
      </Route>

      {/* === 404 Not Found === */}
      <Route path="*" element={<p>페이지를 찾을 수 없습니다.</p>} />
    </Routes>
  );
}
