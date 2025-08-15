import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, VStack, Text, Spinner, Button, HStack, Badge } from '@chakra-ui/react';
import type { StackProps } from '@chakra-ui/react'
import { getRequest } from '@/api/requests';
import { isAxiosError } from 'axios';
import ProfileCard from '@/components/profile/ProfileCard';
import profile_manito from '@/assets/ttomas/profile_manito.png'
import profile_manitee from '@/assets/ttomas/profile_manitee.png'
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
interface StatsDisplayProps extends StackProps {
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
        <Text textStyle="body_sm">{title}</Text>
        <Text textStyle="body_sm">{value}</Text>
    </HStack>
);

interface MissionDisplayProps {
    title: string;
    completed: boolean;
}

// 미션 정보를 표시하는 컴포넌트
const MissionDisplay: React.FC<MissionDisplayProps> = ({ title, completed }) => (
    <HStack justifyContent="space-between" w="100%" py={2}>
        <Text textStyle="body_sm">{title}</Text>
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

  // 공유하기 버튼 클릭 시 링크를 복사하는 함수
  const handleShareClick = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('링크가 복사되었어요!');
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('복사에 실패했습니다. 다시 시도해주세요.');
      });
  };

  useEffect(() => {
    console.log("1. useEffect 시작, roomId:", roomId); 

    if (!roomId) {
        console.log("roomId가 없어서 중단합니다."); // 디버깅 로그
        setIsLoading(false); // roomId가 없으면 로딩을 중단해야 합니다.
        return;
    }

    const fetchReportDetail = async () => {
      console.log("2. fetchReportDetail 함수 실행"); 
      setIsLoading(true);
      setError(null);
      try {
        console.log(`3. API 호출 시작: /report/reportdetail/${roomId}`); 
        const data = await getRequest<ReportDetail>(`/report/reportdetail/${roomId}`);
        console.log("4. API 호출 성공, 데이터:", data);
        setReport(data);
      } catch (err) {
        console.error("5. API 호출 중 에러 발생:", err); 
        let errorMessage = '리포트 상세 정보를 불러오는데 실패했습니다.';
        if (isAxiosError(err) && err.response) {
            errorMessage = err.response.data?.message || err.message;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        console.log("6. finally 블록 실행, 로딩 종료.");
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
    <Box p={3} m={3}>
      <VStack align="stretch">
        {/* 헤더 */}
        <Box>
            <Text textStyle="title_mlg">✪ {report.roomName}리포트</Text>
            <Text textStyle="caption_sm">너와 나 사이 관찰 보고서</Text>
        </Box>
        <HStack justifyContent="flex-end">
        <Button bg="#C39CFF"
            color="white"
            _hover={{ bg: '#B388FF' }}
            size="sm" 
            borderRadius="2xl"
            flexShrink={0}  onClick={handleShareClick}>
              공유하기
          </Button>
        </HStack>
        
        {/* 마니또와의 기록 */}
        <VStack gap={4} align="stretch" w="100%"  mb={3}>
            <Text textStyle="title_md">마니또와의 기록</Text>
            <ProfileCard 
                title="내 마니또"
                name={report.receivingHelp.manittoName || '알 수 없음'}
                subtitle="나의 소중한 마니또"
                src={profile_manito}
            />
            <VStack gap={0} align="stretch" textStyle="body_sm">
                <StatsDisplay title="내 정답 순위" value={`${report.receivingHelp.stats.myCorrectGuessCount > 0 ? '1위' : '-'}`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="내가 맞춘 횟수" value={`${report.receivingHelp.stats.myCorrectGuessCount}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="나를 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountReceived}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.receivingHelp.stats.pokeCountSent}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="채팅 횟수" value={`${report.receivingHelp.stats.pairChatCount}회`} />
                <StatsDisplay title="통화 시간" value={formatDuration(report.receivingHelp.stats.pairCallDurationSec)} borderBottomWidth="1px" borderColor="gray.200"/>
                {/* 미션 목록 섹션 */}
                <Box>
                    <Text textStyle="body_sm" py={3}>받은 미션</Text>
                    {report.receivingHelp.missionsFromManitto && report.receivingHelp.missionsFromManitto.length > 0 ? (
                        report.receivingHelp.missionsFromManitto.map(mission => (
                            <MissionDisplay key={mission.missionId} title={mission.title} completed={mission.completed} />
                        ))
                    ) : (
                        <Text textStyle="body_sm">받은 미션이 없습니다.</Text>
                    )}
                </Box>
            </VStack>
        </VStack>

        <Box h="20px" />

        {/* 마니띠와의 기록 */}
        <VStack gap={4} align="stretch" w="100%" mb={3}>
            <Text textStyle="title_md">마니띠와의 기록</Text>
            <ProfileCard 
                title="내 마니띠"
                name={report.givingHelp.manitteeName || '알 수 없음'}
                subtitle="내가 도와준 마니띠"
                src={profile_manitee}
            />
            <VStack gap={0} align="stretch" textStyle="body_sm">
                <StatsDisplay title="내 정답 순위" value={`${report.givingHelp.stats.myCorrectGuessCount > 0 ? '1위' : '-'}`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="내가 맞춘 횟수" value={`${report.givingHelp.stats.myCorrectGuessCount}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="나를 찌르기한 횟수" value={`${report.givingHelp.stats.pokeCountReceived}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="내가 찌르기한 횟수" value={`${report.givingHelp.stats.pokeCountSent}회`} borderBottomWidth="1px" borderColor="gray.200" />
                <StatsDisplay title="채팅 횟수" value={`${report.givingHelp.stats.pairChatCount}회`} />
                <StatsDisplay title="통화 시간" value={formatDuration(report.givingHelp.stats.pairCallDurationSec)} borderBottomWidth="1px" borderColor="gray.200"/>
                 {/* 미션 목록 섹션 */}
                 <Box>
                    <Text textStyle="body_sm" py={3}>수행한 미션</Text>
                    {report.givingHelp.missionsIDid && report.givingHelp.missionsIDid.length > 0 ? (
                        report.givingHelp.missionsIDid.map(mission => (
                            <MissionDisplay key={mission.missionId} title={mission.title} completed={mission.completed} />
                        ))
                    ) : (
                        <Text textStyle="body_sm">수행한 미션이 없습니다.</Text>
                    )}
                </Box>
            </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ReportDetailPage;
