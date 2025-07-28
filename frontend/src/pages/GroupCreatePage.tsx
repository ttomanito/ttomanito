import {
  Box,
  Button,
  Container,
  Input,
  VStack,
  Text,
  HStack,
  useCheckboxGroup,
} from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FramedCard from '@/components/ui/FramedCard';
import BackButton from '@/components/ui/BackButton';

const days = ['월', '화', '수', '목', '금', '토', '일'];

const GroupCreatePage = () => {
  const [groupName, setGroupName] = useState('');
  const [endDate, setEndDate] = useState('');
  const { value: selectedDays, setValue: setSelectedDays } = useCheckboxGroup();
  const navigate = useNavigate();

  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    setSelectedDays(next);
  };

  const handleSubmit = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    console.log({ groupName, endDate, selectedDays, roomId });
    navigate(`/room/${roomId}`);
  };

  return (
    <Box minH="100vh">
      <Container>
        <BackButton />
        <FramedCard
          accent="purple.300"
          header="그룹 생성하기"
          footer={
            <Button colorScheme="purple" onClick={handleSubmit} w="full">
              설정 완료
            </Button>
          }
        >
          <VStack align="stretch" gap={6}>
            {/* 그룹 이름 */}
            <Box>
              <Field.Root>
                <Field.Label>그룹 이름</Field.Label>
                <Input
                  placeholder="방 이름을 입력해주세요"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  maxLength={30}
                />
                <Field.HelperText fontSize="sm" color="gray.500">
                  {groupName.length}/30자
                </Field.HelperText>
              </Field.Root>
            </Box>

            {/* 기간 설정 */}
            <Box>
              <Field.Root>
                <Field.Label>기간 설정</Field.Label>
                <Text mt={4} fontWeight="medium">
                  시작일
                </Text>
                <Box bg="gray.100" p={2} rounded="md" fontSize="sm" color="gray.700">
                  2025년 07월 25일 (금)
                </Box>
                <Text fontSize="xs" color="gray.500">
                  방 생성일 당일로 자동 설정됩니다
                </Text>

                <Text mt={4} mb={1} fontWeight="medium">
                  종료일
                </Text>
                <Input
                  type="date"
                  placeholder="종료일을 선택해주세요"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </Field.Root>
            </Box>

            {/* 미션 수행 요일 */}
            <Box>
              <Field.Root>
                <Field.Label>미션 수행 요일</Field.Label>
                <Field.HelperText fontSize="sm" color="gray.500" mb={2}>
                  미션이 제출될 요일을 선택해주세요
                </Field.HelperText>

                <HStack wrap="wrap" gap={2}>
                  {days.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <Button
                        key={day}
                        size="sm"
                        variant={isSelected ? 'solid' : 'outline'}
                        colorScheme="gray"
                        rounded="full"
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </HStack>
              </Field.Root>
            </Box>
          </VStack>
        </FramedCard>
      </Container>
    </Box>
  );
};

export default GroupCreatePage;
