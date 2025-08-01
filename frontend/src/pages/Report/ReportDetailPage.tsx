import { Box, Flex, Button } from '@chakra-ui/react';
import ProfileCard from '@/components/profile/ProfileCard';
import ReportList from '@/components/lists/ReportList';
import SectionHeaderProps from '@/components/section/SectionHeader';

const ReportDetailPage = () => {
  return (
    <Box
      maxW="360px"
      mx="auto"
      p={6}
      borderWidth={1}
      borderColor="gray.100"
      borderRadius="lg"
      bg="white"
      boxShadow="md"
    >
      {/* 제목 */}
      <SectionHeaderProps title="마니또 리포트" sub="너와 나 사이 관찰 보고서"></SectionHeaderProps>
      <Flex mb={2}>
        <Button size="sm" ml="auto" variant="outline" colorScheme="purple">
          {/* <FaShare />  */}
          공유하기
        </Button>
      </Flex>

      {/* 마니또 카드 */}
      <ProfileCard
        title="내 마니또"
        name="권윤정"
        subtitle="간헐적 운명이 이끌질라고 권윤"
        src={'https://bit.ly/sage-adebayo'}
      ></ProfileCard>

      {/* 통계 정보 */}
      <ReportList
        data={[
          { label: '내 정답 순위', value: '1회' },
          { label: '내가 맞힌 횟수', value: '1회' },
          { label: '나를 찌르기한 횟수', value: '1회' },
          { label: '내가 찌르기한 횟수', value: '1회' },
          { label: '통화 시간', value: '1회' },
        ]}
      ></ReportList>
    </Box>
  );
};

export default ReportDetailPage;
