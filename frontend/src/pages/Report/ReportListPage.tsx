import { useState, useEffect } from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';
import { Alert } from '@chakra-ui/alert';
import { useNavigate } from 'react-router-dom';
import { getRequest } from '@/api/requests';

interface Report {
  roomId: number;
  roomName: string;
}

const ReportListPage = () => {
  // 상태 관리: 보고서 목록, 로딩 상태, 에러 상태
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 페이지 이동을 위한 navigate 함수를 초기화합니다.
  const navigate = useNavigate();

  // 컴포넌트가 마운트될 때 API를 호출합니다.
  useEffect(() => {
    const fetchReportHistory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // --- axios 기반의 getRequest를 사용한 API 호출 로직 ---
        // axios client 인스턴스에 이미 Authorization 헤더가 설정되어 있다면,
        // config 객체를 전달할 필요가 없을 수도 있습니다.
        const data = await getRequest<Report[]>('/report/history');
        setReports(data);

      } catch (err: any) {
        // axios 에러 객체에서 메시지를 추출하거나 기본 메시지를 사용합니다.
        const errorMessage = err.response?.data?.message || err.message || '데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error("API 호출 에러:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportHistory();
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 렌더링될 때 한 번만 실행되도록 합니다.

  // 보고서 클릭 시 상세 페이지로 이동하는 함수입니다.
  const handleReportClick = (reportId: number) => {
    console.log(`리포트 상세 페이지로 이동합니다. ID: ${reportId}`);
    // API 명세에 따라 /report/reportdetail/{roomId} 경로로 이동합니다.
    // 실제 라우트 설정에 따라 경로는 '/report/:roomId' 등이 될 수 있습니다.
    navigate(`/report/reportdetail/${reportId}`);
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return (
      <Box p={4} m={4}>
        <Alert status="error" borderRadius="md">
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box p={3} m={3}>
          <VStack align="stretch">

    <Box>
      <Text textStyle="title_mlg">
        ✪ 마니또 리포트
      </Text>
      <Text textStyle="caption_sm">
        너와 나 사이 관찰 보고서
      </Text>
      <VStack gap={3} align="stretch">
        {/* 보고서 목록 섹션 */}
        {reports.length > 0 ? (
          reports.map((report) => (
            <Box
              key={report.roomId}
              p={4}
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
              borderRadius="md"
              transition="background-color 0.2s"
              onClick={() => handleReportClick(report.roomId)}
              border="1px"
              borderColor="gray.200"
            >
              <Text textStyle="body_sm">
                {report.roomName}
              </Text>
            </Box>
          ))
        ) : (
          <Text textStyle="caption_sm">완료된 리포트가 없습니다.</Text>
        )}
      </VStack>
    </Box>
          </VStack>
          </Box>
  );
};

export default ReportListPage;
