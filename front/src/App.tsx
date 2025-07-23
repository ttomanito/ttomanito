import { useEffect, useState } from 'react';
import InstallPrompt from './InstallPrompt';

const App = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // 오프라인/온라인 상태 감지
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🎉 또마니또 PWA</h1>
      <p>이 앱은 React + Vite + PWA로 만들어졌어요!</p>

      {isOffline && (
        <p style={{ color: 'red' }}>⚠️ 오프라인 상태입니다. 일부 기능이 제한될 수 있어요.</p>
      )}

      {/* 👇 설치 유도 컴포넌트 */}
      <InstallPrompt />
    </main>
  );
};

export default App;
