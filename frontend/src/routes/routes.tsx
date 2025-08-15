// src/routes.tsx
import type { LazyExoticComponent, ComponentType } from 'react';
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
// Make sure AuthGuard.tsx exists at src/routes or update the path below if it's elsewhere
import RequireAuthGuard, { PreventAuthGuard } from '@/routes/AuthGuard'; // 🔥 변경: 새로운 가드 import
import { GameOnlyGuard, NonGameGuard } from '@/routes/GameStatusGuard';
import RoomGuard from '@/routes/RoomGuard'; // 🔥 추가: RoomGuard import
import Loading from '@/routes/Loading';

// === lazy 로딩 타입 보조 함수 ===
function lazyImport<P = unknown>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  return React.lazy(factory);
}

// === Pages ===
const MainPage = lazyImport(() => import('@/pages/MainPage'));
const LoginPage = lazyImport(() => import('@/pages/User/LoginPage'));
const RoomCreatePage = lazyImport(() => import('@/pages/Room/RoomCreatePage'));
const WaitingRoomPage = lazyImport(() => import('@/pages/Room/WaitingRoomPage'));
const HomePage = lazyImport(() => import('@/pages/Home/HomePage'));
const ChatListPage = lazyImport(() => import('@/pages/Chat/ChatListPage'));
const ChatRoomPage = lazyImport(() => import('@/pages/Chat/ChatRoomPage'));
const CallPage = lazyImport(() => import('@/pages/Chat/CallPage'));
const GuessPage = lazyImport(() => import('@/pages/Guess/GuessPage'));
const RankingPage = lazyImport(() => import('@/pages/Rank/RankingPage'));
const EditProfile = lazyImport(() => import('@/pages/User/EditProfilePage'));
const ReportListPage = lazyImport(() => import('@/pages/Report/ReportListPage'));
const ReportDetailPage = lazyImport(() => import('@/pages/Report/ReportDetailPage'));
const TestPage = lazyImport(() => import('@/pages/TestPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 🚫 ─────────── 로그인된 사용자 접근 불가 ─────────── */}
          <Route element={<PreventAuthGuard redirectTo="/main" />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* 🔓 ─────────── 비로그인 허용 (기타 공개 페이지) ─────────── */}
          <Route path="/report/reportdetail/:reportId" element={<ReportDetailPage />} />
          <Route path="/test" element={<TestPage />} />

          {/* 🔒 ─────────── 로그인 필요 + 상태별 가드 ─────────── */}
          <Route element={<RequireAuthGuard />}>
            {/* 🏠 대기방 접근 - 방 상태 검증 필요 */}
            <Route element={<RoomGuard />}>
              <Route path="/room/:roomId" element={<WaitingRoomPage />} />
            </Route>

            {/* 🎮 게임 중인 사용자만 접근 가능 (IN_GAME) */}
            <Route element={<GameOnlyGuard />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/chat/:chatRoomId" element={<ChatRoomPage />} />
              <Route path="/chat/:chatRoomId/call" element={<CallPage />} />
              <Route path="/guess" element={<GuessPage />} />
              <Route path="/rank" element={<RankingPage />} />
            </Route>

            {/* 🚫 게임 중이 아닌 사용자만 접근 가능 (IN_NONE, IN_WAITING) */}
            <Route element={<NonGameGuard />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/room" element={<RoomCreatePage />} />
            </Route>

            <Route path="/user/update" element={<EditProfile />} />
            <Route path="/report/reportlist" element={<ReportListPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}