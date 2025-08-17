// src/components/chat/ChatAnalysisModal.tsx
import { Text, Box, Stack, Skeleton } from '@chakra-ui/react';
import BaseModal from '@/components/modal/BaseModal';
import type { ChatAnalysisBrief } from '@/types/chat/analysis';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: ChatAnalysisBrief | null;
  isLoading: boolean;
  error: string | null;
  alreadyUsed: boolean;
};

export default function ChatAnalysisModal({
  isOpen, onClose, data, isLoading, error, alreadyUsed
}: Props) {

 const Title = `상대방 AI 분석${alreadyUsed ? " (내 1회 사용됨)" : ""}`;

  const ErrorAlert = error ? (
    <Box
      bg="red.50"
      border="1px solid"
      borderColor="red.200"
      color="red.700"
      px="3"
      py="2"
      rounded="md"
    >
      {error}
    </Box>
  ) : null;

  const ConfidenceBar = (val: number) => (
    <Box mt="2" h="6px" bg="gray.100" rounded="full" overflow="hidden">
      <Box h="100%" w={`${Math.round(val)}%`} bg="blue.500" />
    </Box>
  );

  const Body = (
    <Stack align="stretch" gap={4}>
      {ErrorAlert}

      {isLoading && (
        <Stack align="stretch" gap={3}>
          <Skeleton h="18px" />
          <Skeleton h="18px" />
          <Skeleton h="60px" />
          <Skeleton h="18px" />
        </Stack>
      )}

      {!isLoading && data && (
        <>
          <Box>
            <Text fontWeight="bold" fontSize="md" color="gray.700">핵심 요약</Text>
            <Text mt="1">{data.summary}</Text>
          </Box>

          <Stack direction="row" gap={4}>
            <Box flex="1">
              <Text fontWeight="bold" fontSize="sm" color="gray.700">스타일</Text>
              <Text mt="1">{data.style}</Text>
            </Box>

            <Box w="180px">
              <Text fontWeight="bold" fontSize="sm" color="gray.700">신뢰도</Text>
              {ConfidenceBar((data.confidence ?? 0) * 100)}
            </Box>
          </Stack>

          <Box h="1px" bg="gray.200" my="2" />

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.700">TOP 3 팁</Text>
            <Stack as="ul" mt="2">
                {data.topTips?.map((tip, i) => (
                <Stack as="li" key={i} direction="row" align="flex-start">
                    <Box
                    w="20px"
                    h="20px"
                    rounded="full"
                    bg="purple.500"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    >
                    {i + 1}
                    </Box>
                    <Text>{tip}</Text>
                </Stack>
                ))}
            </Stack>
            </Box>


          {data.caution && (
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">주의</Text>
              <Text mt="1" color="red.600">{data.caution}</Text>
            </Box>
          )}
        </>
      )}
    </Stack>
  );

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title={Title}
      body={Body}
    />
  );
}
