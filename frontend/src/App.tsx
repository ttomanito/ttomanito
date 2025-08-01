import { Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import { downloadPrompt, setDeferredPrompt } from '@/components/modal/DownloadPrompt';

export default function App() {
  const deferredPrompt = useRef<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setDeferredPrompt(e); // ✅ 핵심: 모달 내부에서도 사용할 수 있게 전달
      downloadPrompt.open('mobile-download', {
        title: '앱으로 더 편하게',
        description: '앱 설치하고 또마니또를 더 간편하게 사용해보세요!',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  return (
    <Router>
      <Suspense fallback={<p>Loading…</p>}>
        <Toaster />
        <AppRoutes />
        <downloadPrompt.Viewport />
      </Suspense>
    </Router>
  );
}
