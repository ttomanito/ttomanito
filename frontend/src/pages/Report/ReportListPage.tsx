import { Box, VStack, Text } from '@chakra-ui/react';

// 보고서 데이터의 타입을 정의합니다.
interface Report {
  id: number;
  title: string;
}

// 표시할 보고서 목록 데이터입니다.
const reportData: Report[] = [
  { id: 1, title: '대전 2반 마니또 리포트' },
  { id: 2, title: 'S206 마니또 리포트' },
];

// 보고서 목록을 표시하는 주 컴포넌트입니다.
const ReportListPage = () => {
  // 보고서 클릭 시 호출될 함수입니다.
  // 실제 프로젝트에서는 react-router-dom의 useNavigate 등을 사용하여 페이지를 이동시킵니다.
  const handleReportClick = (reportId: number) => {
    console.log(`Navigating to report detail page for report ID: ${reportId}`);
    // 예시: navigate(`/report/${reportId}`);
  };

  return (
    <Box p={4} m={4}>
      <Text textStyle="title_mlg" mb={2}>
        ✪ 마니또 리포트
      </Text>
      <Text textStyle="caption_sm" color="gray.600" mb={4}>
        너와 나 사이 관찰 보고서
      </Text>
      <VStack>
        {/* 보고서 목록 섹션 */}
        <VStack gap={4} align="stretch" pl={2}>
          {reportData.map((report) => (
            <Box
              key={report.id}
              p={3}
              _hover={{ bg: 'gray.100', cursor: 'pointer' }} // 마우스를 올리면 배경색 변경
              borderRadius="md"
              transition="background-color 0.2s"
              // 박스를 클릭하면 handleReportClick 함수가 보고서의 id와 함께 호출됩니다.
              onClick={() => handleReportClick(report.id)}
            >
              <Text textStyle="body_sm" color="gray.700">
                {report.title}
              </Text>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default ReportListPage;
