import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, VStack, Text, Spinner, Button, HStack, Badge } from '@chakra-ui/react';
import { getRequest } from '@/api/requests';
import { isAxiosError } from 'axios';
import ProfileCard from '@/components/profile/ProfileCard'; 

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

interface StatsDisplayProps {
  title: string;
  value: string | number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ title, value, ...rest }) => (
    <HStack
        justifyContent="space-between"
        w="100%"
        py={3}
        {...rest} 
    >
        <Text color="gray.600">{title}</Text>
        <Text fontWeight="medium" color="gray.800">{value}</Text>
    </HStack>
);

interface MissionDisplayProps {
    title: string;
    completed: boolean;
}

const MissionDisplay: React.FC<MissionDisplayProps> = ({ title, completed }) => (
    <HStack justifyContent="space-between" w="100%" py={2}>
        <Text>{title}</Text>
        <Badge colorScheme={completed ? 'green' : 'red'} variant="subtle" px={2} py={1} borderRadius="md">
            {completed ? '성공' : '실패'}
        </Badge>
    </HStack>
);


const ReportDetailPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchReportDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRequest<ReportDetail>(`/report/reportdetail/${roomId}`);
        setReport(data);
      } catch (err) {
        let errorMessage = '리포트 상세 정보를 불러오는데 실패했습니다.';
        if (isAxiosError(err) && err.response) {
            errorMessage = err.response.data?.message || err.message;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("API 호출 에러:", err);
      } finally {
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
                <StatsDisplay title="내 정답 순위" value={`${report.receivingHelp.stats.myCorrectGuessCount > 0 ? '1위' : '-'}`} />
                <StatsDisplay title="내가 맞춘 횟수" value={`${report.receivingHelp.stats.myCorrectGuessCount}회`}/>
                <StatsDisplay title="나를 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountReceived}회`} />
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountSent}회`}/>
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
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.givingHelp.stats.pokeCountSent}회`}  />
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
