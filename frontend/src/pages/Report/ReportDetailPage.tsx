import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Badge와 HStackProps를 추가로 import 합니다.
import { Box, VStack, Text, Spinner, Button, HStack, Badge } from '@chakra-ui/react';
import type { StackProps } from '@chakra-ui/react'
import { getRequest } from '@/api/requests'; // 경로는 실제 프로젝트 구조에 맞게 조정해주세요.
// axios 에러 타입 가드를 import 합니다.
import { isAxiosError } from 'axios';
// ProfileCard를 별도 파일에서 import 합니다.
import ProfileCard from '@/components/profile/ProfileCard'; // 실제 ProfileCard.tsx 파일 경로에 맞게 조정해주세요.

// API 응답 데이터 전체에 대한 타입 정의
interface ReportDetail {
  roomId: number;
  roomName: string;
  receivingHelp: HelpInfo;
  givingHelp: HelpInfo;
}

interface HelpInfo {
  manittoName?: string;
  manitteeName?: string;
  stats: Stats;
  missionsFromManitto?: Mission[];
  missionsIDid?: Mission[];
}

interface Stats {
  pokeCountReceived: number;
  pokeCountSent: number;
  pairChatCount: number;
  pairCallDurationSec: number;
  myCorrectGuessCount: number;
}

interface Mission {
  missionId: number;
  title: string;
  type: string;
  completed: boolean;
  completedAt: string | null;
}

// 통화 시간을 "X시간 Y분" 형식으로 변환하는 함수
const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0분";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (hours > 0) result += `${hours}시간 `;
    if (minutes > 0) result += `${minutes}분`;
    return result.trim();
};

// StatsDisplay 컴포넌트의 props 타입을 명확하게 정의합니다.
// HStackProps를 확장하여 HStack이 받는 모든 속성을 받을 수 있도록 합니다.
interface StatsDisplayProps extends StackProps {
  title: string;
  value: string | number;
}

// 통계 정보를 표시하는 컴포넌트
const StatsDisplay: React.FC<StatsDisplayProps> = ({ title, value, ...rest }) => (
    <HStack
        justifyContent="space-between"
        w="100%"
        py={3}
        {...rest} // borderBottomWidth 같은 추가 스타일 속성을 받기 위함
    >
        <Text color="gray.600">{title}</Text>
        <Text fontWeight="medium" color="gray.800">{value}</Text>
    </HStack>
);

// MissionDisplay 컴포넌트의 props 타입을 정의합니다.
interface MissionDisplayProps {
    title: string;
    completed: boolean;
}

// 미션 정보를 표시하는 컴포넌트
const MissionDisplay: React.FC<MissionDisplayProps> = ({ title, completed }) => (
    <HStack justifyContent="space-between" w="100%" py={2}>
        <Text>{title}</Text>
        <Badge colorScheme={completed ? 'green' : 'red'} variant="subtle" px={2} py={1} borderRadius="md">
            {completed ? '성공' : '실패'}
        </Badge>
    </HStack>
);


const ReportDetailPage = () => {
  const { reportId: roomId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("1. useEffect 시작, roomId:", roomId); // 디버깅 로그 1

    if (!roomId) {
        console.log("roomId가 없어서 중단합니다."); // 디버깅 로그
        setIsLoading(false); // roomId가 없으면 로딩을 중단해야 합니다.
        return;
    }

    const fetchReportDetail = async () => {
      console.log("2. fetchReportDetail 함수 실행"); // 디버깅 로그 2
      setIsLoading(true);
      setError(null);
      try {
        console.log(`3. API 호출 시작: /report/reportdetail/${roomId}`); // 디버깅 로그 3
        const data = await getRequest<ReportDetail>(`/report/reportdetail/${roomId}`);
        console.log("4. API 호출 성공, 데이터:", data); // 디버깅 로그 4
        setReport(data);
      } catch (err) {
        console.error("5. API 호출 중 에러 발생:", err); // 디버깅 로그 5
        let errorMessage = '리포트 상세 정보를 불러오는데 실패했습니다.';
        if (isAxiosError(err) && err.response) {
            errorMessage = err.response.data?.message || err.message;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        console.log("6. finally 블록 실행, 로딩 종료."); // 디버깅 로그 6
        setIsLoading(false);
      }
    };

    fetchReportDetail();
  }, [roomId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={5}>
        <Box p={4} bg="red.100" color="red.700" borderRadius="md">
            {error}
        </Box>
      </Box>
    );
  }

  if (!report) {
    return <Box p={5}>리포트 정보를 찾을 수 없습니다.</Box>;
  }

  return (
    <Box p={5} maxW="md" mx="auto">
      <VStack gap={6} align="stretch">
        {/* 헤더 */}
        <Box>
            <Text fontSize="2xl" fontWeight="bold">✪ {report.roomName}</Text>
            <Text color="gray.500">너와 나 사이 관찰 보고서</Text>
        </Box>
        <Button colorScheme="purple" variant="outline" size="sm" alignSelf="flex-end">
            공유하기
        </Button>
        
        {/* 마니또와의 기록 */}
        <VStack gap={4} align="stretch" w="100%">
            <Text fontSize="xl" fontWeight="bold">마니또와의 기록</Text>
            <ProfileCard 
                title="내 마니또"
                name={report.receivingHelp.manittoName || '알 수 없음'}
                subtitle="나의 소중한 마니또"
            />
            <VStack gap={0} align="stretch">
                <StatsDisplay title="내 정답 순위" value={`${report.receivingHelp.stats.myCorrectGuessCount > 0 ? '1위' : '-'}`}  />
                <StatsDisplay title="내가 맞춘 횟수" value={`${report.receivingHelp.stats.myCorrectGuessCount}회`} />
                <StatsDisplay title="나를 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountReceived}회`} />
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountSent}회`} />
                <StatsDisplay title="통화 시간" value={formatDuration(report.receivingHelp.stats.pairCallDurationSec)} />
            </VStack>
            {/* 받은 미션 목록 */}
            <VStack gap={2} align="stretch" mt={4}>
                <Text fontSize="md" fontWeight="bold">받은 미션</Text>
                {report.receivingHelp.missionsFromManitto && report.receivingHelp.missionsFromManitto.length > 0 ? (
                    report.receivingHelp.missionsFromManitto.map(mission => (
                        <MissionDisplay key={mission.missionId} title={mission.title} completed={mission.completed} />
                    ))
                ) : (
                    <Text color="gray.500" fontSize="sm">받은 미션이 없습니다.</Text>
                )}
            </VStack>
        </VStack>

        <Box h="20px" />

        {/* 마니띠와의 기록 */}
        <VStack gap={4} align="stretch" w="100%">
            <Text fontSize="xl" fontWeight="bold">마니띠와의 기록</Text>
            <ProfileCard 
                title="내 마니띠"
                name={report.givingHelp.manitteeName || '알 수 없음'}
                subtitle="내가 도와준 마니띠"
            />
            <VStack gap={0} align="stretch">
                <StatsDisplay title="내 정답 순위" value={`${report.givingHelp.stats.myCorrectGuessCount > 0 ? '1위' : '-'}`} />
                <StatsDisplay title="내가 맞춘 횟수" value={`${report.givingHelp.stats.myCorrectGuessCount}회`} />
                <StatsDisplay title="나를 찌르기한 횟수" value={`${report.givingHelp.stats.pokeCountReceived}회`} />
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.givingHelp.stats.pokeCountSent}회`} />
                <StatsDisplay title="통화 시간" value={formatDuration(report.givingHelp.stats.pairCallDurationSec)} />
            </VStack>
            {/* 수행한 미션 목록 */}
            <VStack gap={2} align="stretch" mt={4}>
                <Text fontSize="md" fontWeight="bold">수행한 미션</Text>
                {report.givingHelp.missionsIDid && report.givingHelp.missionsIDid.length > 0 ? (
                    report.givingHelp.missionsIDid.map(mission => (
                        <MissionDisplay key={mission.missionId} title={mission.title} completed={mission.completed} />
                    ))
                ) : (
                    <Text color="gray.500" fontSize="sm">수행한 미션이 없습니다.</Text>
                )}
            </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ReportDetailPage;
