import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  // Image
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '@/App.css';
import CommonCard from '@/components/CommonCard';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import {
  // useNavigate,
  useParams,
} from 'react-router-dom';
import ProfileList from '@/components/lists/ProfileList';
import { getRequest } from '@/api/requests';
import { connectStomp } from '@/utils/socket.ts'; // 유틸 함수로 작성 권장
// import { connectStomp } from '@/utils/socket.ts'; // 유틸 함수로 작성 권장
// import ttoma_king from '@/assets/ttoma_king.png';

interface Participant {
  name: string;
  statusMessage: string;
}

interface RoomInfo {
  roomId: number;
  creatorId: number;
  name: string;
  status: 'NONE' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';
  startDate: string;
  endDate: string;
  deadline: string;
  missionDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
}

const WaitingRoomPage = () => {
  // const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  dayjs.locale('ko');

  const dayOptions = ['월', '화', '수', '목', '금', '토', '일'];
  const dayMapEngToKor: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };

  const { roomId } = useParams<{ roomId: string }>();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [socket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const initializeRoom = async () => {
      try {
        // 1. 참여 여부 확인 - 다른 게임 이미 참여 중인 경우 대기 불가.
        const canParticapate = await getRequest('/room/check');
        console.log(canParticapate);
        if (!canParticapate) {
          // navigate('/home');
          //   return;
        }

        // 2. 방 정보 조회 - 이미 시작/끝인 게임인 경우 참여 불가.
        const roomData = await getRequest<RoomInfo>(`/room/${roomId}`);
        console.log(roomData);
        setRoomInfo(roomData);

        // // 3. 참여자 목록 조회 - 방장이면 왕관 노출
        const participantData = await getRequest<Participant[]>(`/room/${roomId}/participants`);
        setParticipants(
          participantData?.map(el => {
            return {
              name: el.name,
              statusMessage: el.statusMessage,
            };
          }),
        );
      } catch (err) {
        console.error(err);
      }
    };

    initializeRoom();

    return () => {
      if (socket) socket.close();
    };
  }, [roomId]);

  useEffect(() => {
    const client = connectStomp(roomId, 2, message => {
      // 예: 메시지 종류에 따라 처리
      if (message.type === 'ENTER' || message.type === 'EXIT') {
        setParticipants(prev => [...message.participants]);
      }
    });
    return () => {
      client.deactivate(); // 페이지 나가면 연결 종료
    };
  }, [roomId]);

  useEffect(() => {
    const converted = roomInfo?.missionDays?.map(eng => dayMapEngToKor[eng]).filter(Boolean); // 영어 → 한글 변환
    setSelectedDays(converted ?? []); // 예: ["월", "수", "금"]
  }, [roomInfo]);

  return (
    <Box p={4}>
      <Text textStyle="title_md" mb={2} textAlign="start">
        {roomInfo?.name}
      </Text>
      {/* 기간 설정 */}
      <Flex gap={2}>
        <CommonCard w="full">
          <Box w="full">
            <Text textStyle="body_sm" textAlign="start">
              시작일
            </Text>
            <Box borderRadius="xl" mt={2}>
              <Text textStyle="caption_sm" textAlign="start">
                {/* {roomInfo?.startDate} */}
                {dayjs().format('YY.MM.DD')}
              </Text>
            </Box>
          </Box>
        </CommonCard>
        <CommonCard w="full">
          <Box w="full">
            <Text textStyle="body_sm" textAlign="start">
              종료일
            </Text>
            <Box borderRadius="xl" mt={2}>
              <Text textStyle="caption_sm" textAlign="start">
                {dayjs(roomInfo?.endDate).format('YY.MM.DD')}
              </Text>
            </Box>
          </Box>
        </CommonCard>
      </Flex>

      {/* 미션 수행 요일 */}
      <CommonCard mt={4}>
        <VStack align="start">
          <Text textStyle="body_sm" textAlign="start">
            미션 수행 요일
          </Text>
          <HStack wrap="wrap">
            {dayOptions.map(day => (
              <Button
                key={day}
                size="sm"
                variant="outline"
                borderColor={selectedDays.includes(day) ? 'accent.800' : 'gray.500'}
                color={selectedDays.includes(day) ? 'white' : 'gray.600'}
                borderWidth="1.5px"
                borderRadius="lg"
                bg={selectedDays.includes(day) ? 'accent.800' : 'white'}
                disabled
              >
                {day}
              </Button>
            ))}
          </HStack>
        </VStack>
      </CommonCard>

      {/* 참여자 리스트 */}
      <Text textStyle="title_md" mt={8} mb={2} textAlign="start">
        참여자
      </Text>
      <ProfileList data={participants} />
    </Box>
  );
};

export default WaitingRoomPage;
