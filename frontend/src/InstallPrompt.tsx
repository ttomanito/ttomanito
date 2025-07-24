import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [debugLog, setDebugLog] = useState<string>(''); // ✅ 로그 출력용

  // iOS 감지
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Android: beforeinstallprompt 이벤트 감지
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      alert('✅ beforeinstallprompt 이벤트 발생!'); // ✅ 알림창
      setDebugLog('✅ beforeinstallprompt 이벤트 발생!'); // ✅ 화면 표시
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDebugLog(`➡️ 유저 선택: ${choiceResult.outcome}`); // ✅ 유저 반응 로그
        setShowAndroidPrompt(false);
        setDeferredPrompt(null);
      });
    }
  };

  if (!showAndroidPrompt && !(isIos && isSafari)) return debugLog ? <p>{debugLog}</p> : null;

  return (
    <div
      style={{
        border: '1px solid #ccc',
        background: '#f9f9f9',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        marginTop: '2rem',
      }}
    >
      {debugLog && <p style={{ color: 'green' }}>{debugLog}</p>}

      {showAndroidPrompt && (
        <>
          <p>📲 이 앱을 홈 화면에 설치해 보세요!</p>
          <button
            onClick={handleInstallClick}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: '#5c6ac4',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            설치하기
          </button>
        </>
      )}

      {isIos && isSafari && (
        <>
          <p>🍎 iPhone 사용 중이신가요?</p>
          <p>
            <strong>공유 버튼</strong>{' '}
            <span role="img" aria-label="share">🔗</span>을 누르고
            <br />
            <strong>“홈 화면에 추가”</strong>를 선택해주세요!
          </p>
        </>
      )}
    </div>
  );
};

export default InstallPrompt;
