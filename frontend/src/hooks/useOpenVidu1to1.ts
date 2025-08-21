// src/hooks/useOpenVidu1to1.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { OpenVidu, Publisher, Session, SignalEvent, Subscriber } from 'openvidu-browser';
import { postRequest } from '@/api/requests';
import * as Tone from 'tone';

export type CallPhase = 'idle' | 'ringingOut' | 'ringingIn' | 'connecting' | 'inCall' | 'error';

export function useOpenVidu1to1() {
  const ovRef = useRef<OpenVidu | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const pubRef = useRef<Publisher | null>(null);

  const [phase, setPhase] = useState<CallPhase>('idle');
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const [subs, setSubs] = useState<Subscriber[]>([]);
  const subConnIdsRef = useRef<Set<string>>(new Set());
  const [incomingFrom, setIncomingFrom] = useState<{ id: number; nickname?: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const timerRef = useRef<number | null>(null);

  // ====== remote audio container ======
  function ensureRemoteAudioContainer(): HTMLElement {
    let el = document.getElementById('ov-remote-sounds');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ov-remote-sounds';
      // 화면에는 보이지 않게
      el.style.cssText =
        'position:fixed;left:-9999px;bottom:0;width:0;height:0;overflow:hidden;';
      document.body.appendChild(el);
    }
    return el;
  }
  function clearRemoteAudioContainer() {
    const el = document.getElementById('ov-remote-sounds');
    if (el) el.innerHTML = '';
  }
  // 사용자 제스처 타이밍에 강제 재생(autoplay 보강)
  function resumeRemoteAudio() {
    const c = document.getElementById('ov-remote-sounds');
    if (!c) return;
    const vids = Array.from(c.querySelectorAll('video')) as HTMLVideoElement[];
    for (const v of vids) {
      v.muted = false;
      v.autoplay = true;
      v.playsInline = true;
      // Safari 등에서 실패할 수 있으니 catch
      v.play().catch(() => {});
    }
  }
// ✅ Tone/WebAudio 파이프라인 정리 함수
const processedCleanupRef = useRef<() => void>(() => {});

// ✅ 피치 변조 파라미터 (원하면 UI로 조절)
const pitchParamsRef = useRef({
  semitones: 8,    // 음성 낮추기(-), 높이기(+). 예: -4, +5 등
  windowSize: 0.09, // 0.03~0.12 사이에서 A/B 테스트
  wet: 1.0,         // 1.0 = 100% 변조음, 0~1
});
// ✅ Tone.js로 "피치 변조" 트랙을 만들어 반환 (항상 변조, 실패 시 throw)
async function createProcessedAudioTrackWithTone(deviceId?: string): Promise<MediaStreamTrack> {
  // 1) WebAudio 컨텍스트
  const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioCtx: AudioContext = new Ctx();
  try { await (audioCtx as any).resume?.(); } catch {}

  // 2) Tone 컨텍스트를 우리가 만든 audioCtx로 고정
  //    (Tone이 내부적으로 이 컨텍스트를 쓰게 한다)
  // @ts-ignore
  Tone.setContext(new Tone.Context(audioCtx));

  // 3) 마이크를 Tone.UserMedia로 열기(특정 deviceId + 캡처옵션)
  const um = new (Tone as any).UserMedia();
  await um.open({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      channelCount: 1,
      sampleRate: 48000,
    },
    video: false,
  });

  // 4) 피치 변조 노드 생성
  const pitch = new (Tone as any).PitchShift({
    pitch: pitchParamsRef.current.semitones, // 세미톤(+/-)
    windowSize: pitchParamsRef.current.windowSize,
    delayTime: 0,
    feedback: 0,
  });

  // wet/dry 믹스
  pitch.wet.value = pitchParamsRef.current.wet;

  // 5) 라우팅: Mic -> Pitch -> Destination(MediaStream)
  const dest = audioCtx.createMediaStreamDestination();
  um.connect(pitch);
  // pitch 출력 → AudioNode로 연결
  pitch.connect(dest);

  const track = dest.stream.getAudioTracks()[0];
  if (!track) {
    try { um.close(); } catch {}
    try { audioCtx.close(); } catch {}
    throw new Error('No processed audio track from Tone graph');
  }

  // 6) 정리 함수 저장 (통화 종료/stop 시점에 반드시 호출)
  processedCleanupRef.current = () => {
    try { um.close(); } catch {}
    try { audioCtx.close(); } catch {}
  };

  return track;
}

  const startTimer = () => {
    if (timerRef.current) return;
    setTimerSec(0);
    timerRef.current = window.setInterval(() => setTimerSec((t) => t + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerSec(0);
  };

  const safeSetInCallOnce = () => {
    if (phaseRef.current !== 'inCall') {
      setPhase('inCall');
      startTimer();
    }
  };

  const connectSession = useCallback(async (sessionId: string) => {
    try {
      setPhase('connecting');

      // 1) 백엔드에서 OpenVidu 연결 토큰(원문 전체)을 받아온다 (예: wss://...&token=xxx)
      const { token: rawToken } = await postRequest('/openvidu/token', { sessionId, nickname: 'test' });

      // 2) OV 인스턴스 & 세션 생성
      ovRef.current = new OpenVidu();
      

      // ✅ 2.22.0 호환: TURN만 명시
      ovRef.current.setAdvancedConfiguration({
        iceServers: [
          { urls: ['turn:i13b206.p.ssafy.io:3478?transport=udp'], username: 'ssafy', credential: 'ssafy1234' },
          // 5349(TLS/TCP)도 열어놨다면 추가 (지금 compose에 5349 노출 안 되어 있으면 이 줄은 주석)
          { urls: ['turns:i13b206.p.ssafy.io:5349?transport=tcp'], username: 'ssafy', credential: 'ssafy1234' },
        ],
      });
//       OPENVIDU_WEBRTC_ICE_SERVERS=[
//   {"urls":["turn:i13b206.p.ssafy.io:3478?transport=udp"],"username":"<NEW_USER>","credential":"<NEW_PASS>"},
//   {"urls":["turns:i13b206.p.ssafy.io:5349?transport=tcp"],"username":"<NEW_USER>","credential":"<NEW_PASS>"}
// ]
      const session = ovRef.current.initSession();
      sessionRef.current = session;

      // 3) 세션 이벤트
session.on('streamCreated', (e) => {
  const myId = session.connection?.connectionId;
  const fromId = e.stream.connection?.connectionId;

  // ✅ (1) 내 스트림은 구독하지 않는다 → 내 목소리가 내 스피커로 재생되는 에코 방지
  if (fromId && myId && fromId === myId) {
    console.debug('[OV] skip self stream', fromId);
    return;
  }

  // ✅ (2) 같은 상대를 이미 구독 중이면 무시 → 중복 재생 방지
  if (fromId && subConnIdsRef.current.has(fromId)) {
    console.debug('[OV] duplicate stream ignored', fromId);
    return;
  }

  const container = ensureRemoteAudioContainer();

  const sub = session.subscribe(e.stream, container, {
    subscribeToAudio: true,
    subscribeToVideo: false, // 오디오 전용
  });

  // 구독 엘리먼트 생성 시 재생 보강
  (sub as any).on('videoElementCreated', (ev: any) => {
    const el: HTMLVideoElement | undefined = ev?.element;
    if (el) {
      el.autoplay = true;
      el.playsInline = true;
      el.muted = false;  // 상대 음성만 들림
      el.controls = false;
      el.play().catch(() => {});
    }
  });

  // 스트림 실제 재생 시 한 번 더 보강
  (sub as any).on('streamPlaying', () => {
    resumeRemoteAudio();
  });

  // ✅ (3) 구독 집합/상태 등록
  if (fromId) subConnIdsRef.current.add(fromId);
  setSubs((prev) => [...prev, sub]);

  safeSetInCallOnce();
});


      session.on('streamDestroyed', (e) => {
  const destroyedId = e.stream.streamId;
  const cid = e.stream.connection?.connectionId;            // ✅ 추가
  if (cid) subConnIdsRef.current.delete(cid);               // ✅ 추가
  setSubs((prev) => prev.filter((s) => s.stream?.streamId !== destroyedId));
});
      // 시그널: 발신 벨 수신
      session.on('signal:CALL_REQUEST', (e: SignalEvent) => {
        try {
          const payload = JSON.parse(e.data || '{}');
          setIncomingFrom(payload.from ?? null);
        } catch {
          setIncomingFrom(null);
        }
        setPhase('ringingIn');
      });

      // 시그널: 통화 수락
      session.on('signal:CALL_ACCEPTED', async (e) => {
        const myConnId = session.connection?.connectionId;
        // 내가 보낸(=수신자가 보낸) CALL_ACCEPTED면 무시 → acceptCall에서 이미 publish 했음
        if (e.from?.connectionId === myConnId) return;
        // 상대(발신자) 쪽에서만 퍼블리시 시작
        await startPublishAudio();
        resumeRemoteAudio(); // 재생 보강
      });

      // 시그널: 통화 거절
      session.on('signal:CALL_REJECTED', () => {
        setIncomingFrom(null);
        setPhase('idle');
        stopTimer();
      });

      // 시그널: 통화 종료
      session.on('signal:CALL_ENDED', () => {
        stopPublishAudio();
        setIncomingFrom(null);
        setPhase('idle');
        stopTimer();
        setSubs([]);
        subConnIdsRef.current.clear();
        clearRemoteAudioContainer();
      });

      session.on('sessionDisconnected', () => {
        stopPublishAudio();
        setSubs([]);
        subConnIdsRef.current.clear();
        setIncomingFrom(null);
        setPhase('idle');
        stopTimer();
        clearRemoteAudioContainer();
      });

      // 4) 실제 연결
      await session.connect(rawToken);
      setPhase('idle'); // 연결만 된 상태 (아직 통화 전)
    } catch (err) {
      console.error('[OV] connectSession error', err);
      setPhase('error');
    }
  }, []);

  // 발신: 벨 울리기
  const requestCall = useCallback(async (me: { id: number; nickname?: string }) => {
    const s = sessionRef.current;
    if (!s) return;
    await s.signal({ type: 'CALL_REQUEST', data: JSON.stringify({ from: me }) });
    setPhase('ringingOut');
    // 버튼 클릭 직후(제스처 타이밍) 재생 보강
    resumeRemoteAudio();
  }, []);

  // 수신: 수락
  const acceptCall = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    await s.signal({ type: 'CALL_ACCEPTED' });
    await startPublishAudio(); // 수락한 쪽도 즉시 퍼블리시
    // 버튼 클릭 직후(제스처 타이밍) 재생 보강
    resumeRemoteAudio();
  }, []);

  // 수신: 거절
  const rejectCall = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    await s.signal({ type: 'CALL_REJECTED' });
    setIncomingFrom(null);
    setPhase('idle');
  }, []);

  // 종료
  const endCall = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    await s.signal({ type: 'CALL_ENDED' });
    await stopPublishAudio();
    setIncomingFrom(null);
    setPhase('idle');
    stopTimer();
    setSubs([]);
    clearRemoteAudioContainer();
  }, []);

  // 퍼블리시 시작 (마이크 선택 가능)
  const startPublishAudio = useCallback(async (deviceId?: string) => {
    if (!ovRef.current || !sessionRef.current) return;
    if (pubRef.current) return;

      // 1) 변조 트랙 생성 (Tone.js 기반)
  const processedTrack = await createProcessedAudioTrackWithTone(deviceId);
  console.debug('[OV][FX] processedTrack', processedTrack?.id, processedTrack?.label);

    const pub = await ovRef.current.initPublisherAsync(undefined, {
      audioSource: processedTrack as any, // ← MediaStreamTrack 직접 전달
      videoSource: false,
      publishAudio: true,
      publishVideo: false,
      mirror: false,
      // 음성 품질 옵션
      audioTrackConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false, // <- 먼저 false로 테스트 (깨짐 줄이기)
    channelCount: 1,        // 모노: 음성에 유리, 대역폭↓
    sampleRate: 48000,      // WebRTC 기본/권장
      } as any,
    });

 // 힌트(무해)
  try {
    const tr =
      ((pub.stream as any)?.getMediaStream?.() || (pub.stream as any)?.mediaStream)
        ?.getAudioTracks?.[0];
    if (tr) (tr as any).contentHint = 'speech';
  } catch {}

    await sessionRef.current.publish(pub);
    pubRef.current = pub;
    setIsMuted(false);

  // 4) ✅ 최종 보증: 실제 송신자가 processedTrack을 쓰는지 확인 → 아니면 강제 교체
  try {
    const pc = (pub as any)?.rtcPeer?.pc as RTCPeerConnection | undefined;
    const sender = pc?.getSenders().find(s => s.track?.kind === 'audio');
    if (sender) {
      const beforeId = sender.track?.id;
      if (sender.track !== processedTrack) {
        await sender.replaceTrack(processedTrack);
        console.debug('[OV][FX] sender.replaceTrack applied', { beforeId, afterId: processedTrack.id });
      } else {
        console.debug('[OV][FX] processedTrack already in use', processedTrack.id);
      }
    } else {
      console.warn('[OV][FX] no audio sender found to verify/replace');
    }
  } catch (err) {
    console.warn('[OV][FX] replaceTrack failed (will still use audioSource track)', err);
  }
}, []);
  // 퍼블리시 중단 (+마이크 해제)
  const stopPublishAudio = useCallback(async () => {
    if (!sessionRef.current || !pubRef.current) return;
    try {
      sessionRef.current.unpublish(pubRef.current);
    } catch {}
    try {
      const ms =
        (pubRef.current.stream as any)?.getMediaStream?.() ||
        (pubRef.current.stream as any)?.mediaStream;
      (ms as MediaStream | undefined)?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    pubRef.current = null;
    setIsMuted(false);
  }, []);

  // 마이크 on/off
  const toggleMute = useCallback(() => {
    const pub = pubRef.current;
    if (!pub) return;
    const next = !isMuted;
    pub.publishAudio(!next);
    setIsMuted(next);
  }, [isMuted]);

  // 언로드/언마운트 정리
  useEffect(() => {
    const onUnload = () => {
      try { sessionRef.current?.disconnect(); } catch {}
    };
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      try { sessionRef.current?.disconnect(); } catch {}
      stopTimer();
      setSubs([]);
       subConnIdsRef.current.clear();  
      setIncomingFrom(null);
      pubRef.current = null;
      ovRef.current = null;
      clearRemoteAudioContainer();
    };
  }, []);

  return {
    // 상태
    phase,
    subscribers: subs,
    incomingFrom,
    isMuted,
    timerSec,
    // 액션
    connectSession,
    requestCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    startPublishAudio,
    stopPublishAudio,
  };
}

