// HomePage.tsx

import CustomButton from '@/components/ui/CustomButton';
import React from 'react';
import { Box, Text, Stack, Icon, Progress, Flex, Image, Container } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import FramedCard from '@/components/ui/FramedCard';
import { VStack } from '@chakra-ui/react';
import ProfileListItem from '@/components/lists/ProfileListItem';
import GuessListItem from '@/components/lists/GuessListItem';
import MissionListItem from '@/components/lists/MissionListItem';
import RankingListItem from '@/components/lists/RankingListItem';

const TOTAL_MISSIONS = 7;
const COMPLETED_MISSIONS = 5;
const color = '#a4b8fbff';
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const progressValue = (COMPLETED_MISSIONS / TOTAL_MISSIONS) * 100;

  return (
    <Container maxW="480px" px={4}>
      {/* Mission Card */}
      <FramedCard
        mt={3}
        w="full"
        accent={color}
        header="오늘의 미션"
        footer={
          <CustomButton w="full" bg={color} onClick={() => navigate('/')}>
            미션 완료!
          </CustomButton>
        }
      >
        <Text fontWeight="bold" fontSize="lg" mb={1}>
          몰래 과자 선물하기!!
        </Text>
        <Text fontSize="sm" color="gray.600">
          내 마니또에게 들키지 않고 선물을 전해주세요
        </Text>

        <Image src="/assets/bread.svg" alt="bread icon" boxSize="120px" mx="auto" mt={6} mb={2} />
      </FramedCard>

      {/* Progress bar */}
      <Box w="full" mt={4}>
        <Progress.Root value={progressValue} borderRadius="full" size="lg" bg="white">
          <Progress.Track>
            <Progress.Range bgGradient="linear(to-r, #000000, #E2E8F0)" />
          </Progress.Track>
        </Progress.Root>
        <Text fontSize="sm" fontWeight="medium" textAlign="right" mt={1}>
          {COMPLETED_MISSIONS} / {TOTAL_MISSIONS}일
        </Text>
      </Box>

      {/* Utility Cards */}
      <Stack gap={4} mt={6} pb={6}>
        {[
          {
            title: '이전 미션 목록 보기',
            description: '그동안 수행했던 미션을 확인 할 수 있어요.',
          },
          {
            title: '튜토리얼 보기',
            description: '도마니또 이용 방법을 알 수 있어요.',
          },
        ].map(({ title, description }) => (
          <Flex
            key={title}
            align="center"
            bg="white"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            w="full"
            gap={4}
          >
            <Icon as={FaCheckCircle} color="#a4b8fbff" boxSize={6} />
            <Box>
              <Text fontWeight="medium">{title}</Text>
              <Text fontSize="sm" color="gray.500">
                {description}
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
      <Box mb={6}>
        <Text fontSize="md" fontWeight="bold" mb={2}>
          오늘의 미션 체크
        </Text>
        <MissionListItem date="07.28" content="몰래 과자 선물하기" completed={true} />
        <MissionListItem date="07.28" content="간식주기" completed={false} />
      </Box>
      <VStack>
        <ProfileListItem name="안수진" statusMessage="햄?" />
        <ProfileListItem name="김철수" statusMessage="오늘도 화이팅🔥" />
      </VStack>
      <Text fontSize="md" fontWeight="bold" mb={2}>
        이전 추측 기록
      </Text>
      <VStack>
        <GuessListItem date="07.25" name="길태윤" />
        <GuessListItem date="07.24" name="김민지" />
        <GuessListItem date="07.23" name="박태호" />
      </VStack>
      <RankingListItem rank={1} name="안수진" statusMessage="햄" score={7}></RankingListItem>
      <RankingListItem rank={4} name="안수진" statusMessage="햄부기" score={7}></RankingListItem>
    </Container>
  );
};

export default HomePage;
