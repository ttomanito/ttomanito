// src/pages/CallRoomPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { useOpenVidu1to1 } from '@/hooks/useOpenVidu1to1';

export default function CallRoomPage() {
  const { callRoomId } = useParams<{ callRoomId: string }>();
  const navigate = useNavigate();

  const {
    phase,
    isMuted,
    timerSec,
    subscribers,
    incomingFrom,
    connectSession,
    requestCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  } = useOpenVidu1to1();

  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const [playBlocked, setPlayBlocked] = useState(false);

  // 중복 연결 방지
  const hasConnected = useRef(false);
  useEffect(() => {
    if (!callRoomId || hasConnected.current) return;
    hasConnected.current = true;
    connectSession(callRoomId);
  }, [callRoomId, connectSession]);

  // 상대 오디오 자동 연결
  useEffect(() => {
    subscribers.forEach((sub, i) => {
      const el = audioRefs.current[i];
      if (el) {
        // @ts-ignore
        el.srcObject = sub.stream.getMediaStream();
        el.autoplay = true;
       
        el.play().catch(() => setPlayBlocked(true));
      }
    });
  }, [subscribers]);

  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  return (
    <Box
      position="fixed"
      inset={0}
      bgGradient="linear(to-b, gray.50, gray.100)"
      display="grid"
      placeItems="center"
      px={4}
    >
      {/* 상단: 왼쪽에만 나가기 버튼 */}
      <Box position="absolute" top={3} left={4}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ⬅ 나가기
        </Button>
      </Box>

      {/* 본문 카드 */}
      <Box
        w="min(92vw, 360px)"
        h="min(78vh, 720px)"
        bg="white"
        borderRadius="3xl"
        boxShadow="xl"
        p={6}
        display="flex"
        flexDir="column"
      >
        {/* 타이머 */}
        <Box h="64px" display="grid" placeItems="center">
          <Text fontSize="md" fontWeight="semibold" color="gray.600">
            {phase === 'inCall' ? `${mm}:${ss}` : '00:00'}
          </Text>
        </Box>

        {/* 중앙 정보 */}
        <Box flex="1" display="grid" placeItems="center" textAlign="center" gap={2}>
          <Text fontSize="4xl" lineHeight="1">📞</Text>
          <Text fontSize="lg" fontWeight="bold">
            {incomingFrom?.nickname ?? '상대'}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {phase === 'ringingOut'
              ? '연결 중...'
              : phase === 'ringingIn'
              ? '전화가 오고 있습니다'
              : phase === 'inCall'
              ? '통화가 진행 중입니다'
              : '대기 중'}
          </Text>
        </Box>

        {/* 하단 컨트롤 */}
        <Box pt={2} pb={1}>
          {phase === 'ringingIn' ? (
            <HStack justify="center">
              <Button
                borderRadius="full"
                size="lg"
                colorScheme="green"
                onClick={acceptCall}
              >
                ✅ 수락
              </Button>
              <Button
                borderRadius="full"
                size="lg"
                colorScheme="red"
                onClick={rejectCall}
              >
                ❌ 거절
              </Button>
            </HStack>
          ) : phase === 'inCall' ? (
            <HStack justify="center">
              <Button
                borderRadius="full"
                size="lg"
                onClick={toggleMute}
              >
                {isMuted ? '🎙️ 켜기' : '🔇 끄기'}
              </Button>
              <Button
                borderRadius="full"
                size="lg"
                colorScheme="red"
                onClick={endCall}
              >
                🔚 종료
              </Button>
            </HStack>
          ) : (
            <Box textAlign="center">
              {phase === 'ringingOut' ? (
                <Button
                  borderRadius="full"
                  size="lg"
                  colorScheme="red"
                  onClick={endCall}
                >
                  ⛔ 발신 취소
                </Button>
              ) : (
                <Button
                
                  onClick={() => requestCall({ id: 1, nickname: '나' })}
                  colorScheme="teal"
                  size="lg"
                  borderRadius="full"
                >
                  전화 걸기
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* 하단: 오디오 재생 허용만 */}
      {playBlocked && (
        <Box position="absolute" bottom={4} right={4}>
          <Button
            size="sm"
            onClick={() => {
              audioRefs.current.forEach((a) => a?.play().catch(() => {}));
              setPlayBlocked(false);
            }}
          >
            오디오 재생 허용
          </Button>
        </Box>
      )}

      {/* 구독자 오디오 */}
      {subscribers.map((_, i) => (
        <audio
          key={i}
          ref={(el) => {
            if (el) audioRefs.current[i] = el;
          }}
        />
      ))}
    </Box>
  );
}
