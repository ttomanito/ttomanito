// src/pages/NoticePage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Spinner, Text } from '@chakra-ui/react';
import BasicListItem from '@/components/lists/BasicListItem';
import { getRequest, patchRequest } from '@/api/requests';

type NoticeType = 'MISSION' | 'GUESS' | 'POKE' | 'FINISHED' | 'SYSTEM';

type Notice = {
  noticeId: number;
  type: NoticeType;
  check: boolean;
  createdAt?: string; // 있으면 mm.dd로 표시
  message?: string; // 있으면 그대로 사용
};

const TYPE_TEXT: Record<NoticeType, string> = {
  MISSION: '오늘의 미션을 확인하세요!',
  GUESS: '마니또에게 추측당했어요.',
  POKE: '내 마니또/마니띠가 날 찔렀어요!',
  FINISHED: '게임이 종료되었어요.',
  SYSTEM: '내 마니또/마니띠가 탈퇴했어요',
};

const formatMMDD = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
};

const NoticePage: React.FC = () => {
  const [list, setList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let data = await getRequest<Notice[]>('/notice');
        if (data.length == 0) {
          data = [
            {
              noticeId: 0,
              type: 'POKE',
              check: true,
            },
            {
              noticeId: 0,
              type: 'POKE',
              check: true,
            },
            {
              noticeId: 0,
              type: 'MISSION',
              check: true,
            },
          ];
        }
        if (!alive) return;
        setList(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? '알림을 불러오지 못했어요');
      } finally {
        if (alive) setLoading(false);
      }

      try {
        // 진입 시 전체 읽음 처리
        await patchRequest<void>('/notice/check');
      } catch (e) {
        console.warn('[notice] read-all failed:', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box w="full" maxW="640px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>
      <Heading as="h1" size="lg" mb={4}>
        알림함
      </Heading>

      {loading ? (
        <Box py={12} textAlign="center">
          <Spinner />
        </Box>
      ) : err ? (
        <Text color="red.500">{err}</Text>
      ) : list.length === 0 ? (
        <Text color="gray.500">알림이 없습니다.</Text>
      ) : (
        <VStack align="stretch">
          {list.map(n => {
            const date = formatMMDD(n.createdAt);
            const content = n.message ?? TYPE_TEXT[n.type] ?? '알림이 도착했어요';
            return (
              <Box
                key={n.noticeId}
                bg="gray.50"
                borderRadius="md"
                px={4}
                py={3}
                opacity={n.check ? 0.8 : 1}
              >
                <BasicListItem date={date} content={content} />
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default NoticePage;
