import {
  Box,
  Text,
  VStack,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/App.css';
import { addDays } from 'date-fns';
import CommonCard from '@/components/cards/CommonCard';
import TextInput from '@/components/inputs/TextInput';
import LongButton from '@/components/buttons/LongButton';
import type { LongButtonProps } from '@/components/buttons/LongButton';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import DateInput from '@/components/inputs/DateInput';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuth } from '@/stores/authStore'; 

const korToEngDay = {
  '월': 'MON',
  '화': 'TUE',
  '수': 'WED',
  '목': 'THU',
  '금': 'FRI',
  '토': 'SAT',
  '일': 'SUN',
};

const RoomCreatePage = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  dayjs.locale('ko');
  const today = dayjs().format('YYYY년 MM월 DD일 dddd');

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const dayOptions = ['월', '화', '수', '목', '금', '토', '일'];

  const handleCreateRoom = async () => {
    if (!groupName || !endDate || selectedDays.length === 0) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    setLoading(true);

    const missionDays = selectedDays.map(
      (kor) => korToEngDay[kor as keyof typeof korToEngDay]
    );
    const deadline = dayjs(endDate).format('YYYY-MM-DD');

    try {
      const res = await api.post('/room', {
        name: groupName,
        deadline,
        missionDays,
      });

      const { roomId } = res.data;
      
      // ✨ 2. 방 생성 성공 후, auth 스토어 상태를 업데이트합니다.
      // 이 시점에 사용자는 게임에 참여한 것이며, 방의 생성자입니다.
      useAuth.getState().joinGame(roomId, true); // isCreator: true
      console.log(roomId)

      // ✨ 3. 상태 업데이트 후 게임 페이지로 이동합니다.
      navigate(`/home`);
    } catch (err) {
      console.error(err);
      alert('방 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const longButtonProps: LongButtonProps = {
    loading,
    disabled: loading,
    onClick: handleCreateRoom,
    children: '설정 완료',
  };

  return (
    <Box px={4} py={6}>
      <Text textStyle="title_mlg" m={8}>방 생성하기</Text>

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

      <CommonCard w="full" mt={4}>
        <VStack align="start" w="full">
          <Text textStyle="title_md">기간 설정</Text>
          <Box w="full">
            <Text textStyle="body_sm" textAlign="start">시작일</Text>
            <Box bg="gray.100" w="full" borderRadius="xl" px={4} py={2} mt={2}>
              <Text textStyle="body_md" textAlign="start">{today}</Text>
              <Text textStyle="caption_xs_light" textAlign="start">방 생성일 당일로 자동 설정됩니다</Text>
            </Box>
          </Box>

          <Box width="100%">
            <Text textStyle="body_sm" textAlign="start" mb={2}>종료일</Text>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
                renderCustomHeader={({
    date,
    decreaseMonth,
    increaseMonth,
  }) => (
    <div className="custom-datepicker-header">
      <button onClick={decreaseMonth}>{'<ㅤㅤㅤ'}</button>
      <span>{format(date, 'yyyy년 M월', { locale: ko })}</span>
      <button onClick={increaseMonth}>{'ㅤㅤㅤ>'}</button>
    </div>
  )}
              wrapperClassName="datepicker-full-width"
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}
              dateFormat="yyyy-MM-dd"
              placeholderText="종료일을 선택해주세요"
              locale={ko}
              customInput={
                <DateInput
                  value={endDate ? dayjs(endDate).format('YYYY-MM-DD') : ''}
                  placeholder="종료일을 선택해주세요"
                />
              }
            />
            <Text textStyle="caption_xs_light" textAlign="start" mt={2}>오늘로부터 30일까지 선택 가능</Text>
          </Box>
        </VStack>
      </CommonCard>

      <CommonCard mt={4}>
        <VStack align="start">
          <Text textStyle="title_md">미션 수행 요일</Text>
          <Text textStyle="caption_xs_light">미션이 제공될 요일을 선택해주세요</Text>

          <SimpleGrid columns={7} gap={3} w="100%">
            {dayOptions.map((day) => (
              <Button
                key={day}
                size="sm"
                variant="outline"
                borderColor={selectedDays.includes(day) ? 'accent.500' : 'gray.300'}
                color={selectedDays.includes(day) ? 'accent.500' : 'gray.600'}
                borderWidth="1.5px"
                borderRadius="lg"
                bg="white"
                onClick={() => toggleDay(day)}
                _hover={{ borderColor: 'purple.400' }}
                _active={{ bg: 'white' }}
              >
                {day}
              </Button>
            ))}
          </SimpleGrid>
        </VStack>
      </CommonCard>

      <Box mt={6}>
        <LongButton {...longButtonProps} />
      </Box>
    </Box>
  );
};

export default RoomCreatePage;
