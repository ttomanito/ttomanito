// src/routes.tsx
import type { LazyExoticComponent, ComponentType } from 'react';
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/routes/RequireAuth';
import Loading from '@/routes/Loading';

// === lazy 로딩 타입 보조 함수 ===
function lazyImport<P = unknown>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  return React.lazy(factory);
}

// === Layouts ===

// === Pages ===
const MainPage = lazyImport(() => import('@/pages/MainPage')); // /
const LoginPage = lazyImport(() => import('@/pages/User/LoginPage')); // /auth/LoginPage
const RoomCreatePage = lazyImport(() => import('@/pages/Room/RoomCreatePage')); // /room
const WaitingRoomPage = lazyImport(() => import('@/pages/Room/WaitingRoomPage')); // /room/:roomId
const MatchingPage = lazyImport(() => import('@/pages/Room/MatchingPage')); // /manito/:roomId/matching
const HomePage = lazyImport(() => import('@/pages/Home/HomePage')); // /home
const ChatListPage = lazyImport(() => import('@/pages/Chat/ChatListPage')); // /chat
const ChatRoomPage = lazyImport(() => import('@/pages/Chat/ChatRoomPage')); // /chat/:chatRoomId
const CallPage = lazyImport(() => import('@/pages/Chat/CallPage')); // /chat/:chatRoomId/call
const GuessPage = lazyImport(() => import('@/pages/Guess/GuessPage')); // /guess
const RankingPage = lazyImport(() => import('@/pages/Rank/RankingPage')); // /rank
const ProfilePage = lazyImport(() => import('@/pages/User/ProfilePage')); // /user/update
const ReportListPage = lazyImport(() => import('@/pages/Report/ReportListPage')); // /report/reportlist
const ReportDetailPage = lazyImport(() => import('@/pages/Report/ReportDetailPage')); // /report/reportdetail/:reportId

const TestPage = lazyImport(() => import('@/pages/TestPage')); // /report/reportdetail/:reportId
export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 🔓 ─────────── 비로그인 허용 ─────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/report/reportdetail/:reportId" element={<ReportDetailPage />} />
          <Route path="/room/:roomId" element={<WaitingRoomPage />} />

          {/* 🔒 ─────────── 나머지 전부 보호 ─────────── */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/room" element={<RoomCreatePage />} />
            <Route path="/manito/:roomId/matching" element={<MatchingPage />} />
            <Route path="/chat/:chatRoomId/call" element={<CallPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:chatRoomId" element={<ChatRoomPage />} />
            <Route path="/guess" element={<GuessPage />} />
            <Route path="/rank" element={<RankingPage />} />
            <Route path="/user/update" element={<ProfilePage />} />
            <Route path="/report/reportlist" element={<ReportListPage />} />
            <Route path="/test" element={<TestPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
