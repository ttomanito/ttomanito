import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/App.css';
import { addDays } from 'date-fns';
import CommonCard from '@/components/CommonCard';
import TextInput from '@/components/TextInput';
import LongButton from '@/components/buttons/LongButton';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import DateInput from '@/components/DateInput';

const RoomCreatePage = () => {
  const [groupName, setGroupName] = useState('');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  dayjs.locale('ko');
  const today = dayjs().format('YYYY년 MM월 DD일 dddd');

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const dayOptions = ['월', '화', '수', '목', '금', '토', '일'];
  
  return (
    <Box p={4}>
      <Text textStyle="title_mlg" mb={4}>
        방 생성하기
      </Text>

      {/* 방 이름 입력 */}
      <CommonCard>
        <VStack align="start">
          <Text textStyle="title_md">방 이름</Text>
          <TextInput
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="방 이름을 입력해주세요"
          />
          <Text textStyle="caption_xs_light">{`${groupName.length}/30 자`}</Text>
        </VStack>
      </CommonCard>

      {/* 기간 설정 */}
      <CommonCard w="full" mt={4}>
        <VStack align="start" w="full">
          <Text textStyle="title_md">기간 설정</Text>

          <Box w="full" >
            <Text textStyle="body_sm">
              시작일
            </Text>
            <Box bg="gray.100" w="full" borderRadius="xl" px={4} py={2} mt={2}>
              <Text textStyle="body_md">
                {today}
              </Text>
              <Text textStyle="caption_xs_light">
                방 생성일 당일로 자동 설정됩니다
              </Text>
            </Box>
          </Box>


          <Box w="full">
            <Text textStyle="body_sm">
              종료일
            </Text>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}   // 오늘 + 30일까지 선택 가능 
              dateFormat="yyyy-MM-dd"
              placeholderText="종료일을 선택해주세요" // ✅ 캘린더 내부에서 참조
              customInput={
                <DateInput
                  value={endDate ? dayjs(endDate).format('YYYY-MM-DD') : ''}
                  placeholder="종료일을 선택해주세요                 " 
                />
              }
            />
            <Text textStyle="caption_xs_light">
              오늘로부터 30일까지 선택 가능
            </Text>
            {/* <TextInput
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="종료일을 선택해주세요"
            /> */}
          </Box>
        </VStack>
      </CommonCard>

      {/* 미션 수행 요일 */}
      <CommonCard mt={4}>
        <VStack align="start">
          <Text textStyle="title_md">미션 수행 요일</Text>
          <Text textStyle="caption_xs_light">
            미션이 제공될 요일을 선택해주세요
          </Text>

          <HStack wrap="wrap">
          {dayOptions.map((day) => (
            <Button
              key={day}
              size="sm"
              variant="outline" 
              borderColor={selectedDays.includes(day) ? 'accent.500' : 'gray.300'}
              color={selectedDays.includes(day) ? 'accent.500' : 'gray.600'}
              borderWidth={selectedDays.includes(day) ? '1.5px' : '1.5px'}
              borderRadius="lg"
              bg="white" // ✅ 배경 고정
              onClick={() => toggleDay(day)}
              _hover={{
                borderColor: 'purple.400',
              }}
              _active={{
                bg: 'white',
              }}
            >
              {day}
            </Button>
            ))}
          </HStack>

        </VStack>
      </CommonCard>

      {/* 완료 버튼 */}
      <Box mt={6}>
        <LongButton>
          {/* // onClick={() => { */}
          {/* //   // 제출 처리 로직 */}
          {/* // }}> */}
        설정 완료
        </LongButton>
      </Box>
    </Box>
  );
};

export default RoomCreatePage;
