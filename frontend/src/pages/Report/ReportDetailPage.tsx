// import { createStubPage } from '../_stub';
// const ReportDetailPage = createStubPage('ReportDetailPage');
// components/ManitoReport.tsx

import {
  Box,
  Text,
  Heading,
  Flex,
  AvatarGroup,
  Avatar,
  VStack,
  //   Divider,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FaShare } from 'react-icons/fa';
import ProfileCard from '@/components/profile/ProfileCard';
import ReportList from '@/components/lists/ReportList';

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
      <Flex justify="space-between" align="center" mb={4}>
        <Box pt={4} pb={4} minHeight="124px">
          <Text textStyle="title_mlg">마니또 리포트</Text>
          <Text textStyle="caption_sm" color="gray.500">
            너와 나 사이 관계 보고서
          </Text>
        </Box>
        {/* <Button size="sm" variant="outline" colorScheme="purple">
          <FaShare /> 공유하기
        </Button> */}
      </Flex>

      {/* 보고서 타이틀 */}
      <Text textStyle="title_ml" mb={2}>
        000000 결과 보고서
      </Text>
      <Text textStyle="title_md" mb={4}>
        마니또와의 기록
      </Text>
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
