import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react'
import CommonCard from '@/components/CommonCard'
import DoubleButton from '@/components/buttons/DoubleButton'
import ProfileListItem from '@/components/lists/ProfileListItem'
import { useNavigate } from 'react-router-dom'

const participants = [
  { name: '안수진', desc: '랩?', isLeader: true },
  { name: '이지혜', desc: '테니스팡' },
  { name: '길태은', desc: '길쉐프' },
  { name: '우지연', desc: '우' },
]

const selectedDays = ['월', '화', '수']
const startDate = '07.25'
const endDate = '07.30'

const RoomWaitingPage = () => {
  const navigate = useNavigate()

  return (
    <Box p={4} pb={6}>
      {/* 뒤로가기 + 제목 */}
      <Text textStyle="title_lg" mb={2}>
        대기방
      </Text>

      {/* 방 정보 카드 */}
      <CommonCard mb={4}>
        <VStack gap={4} align="start" w="full">
          <HStack w="full" justify="space-between">
            <Box>
              <Text textStyle="body_sm" color="gray.600">
                시작일
              </Text>
              <Text textStyle="body_md">{startDate}</Text>
            </Box>
            <Box>
              <Text textStyle="body_sm" color="gray.600">
                종료일
              </Text>
              <Text textStyle="body_md">{endDate}</Text>
            </Box>
          </HStack>

          {/* 미션 요일 */}
          <Box w="full">
            <Text textStyle="body_sm" color="gray.600" mb={2}>
              미션 수행 요일
            </Text>
            <HStack wrap="wrap" gap={2}>
              {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                <Button
                  key={day}
                  size="xs"
                  variant="outline"
                  borderColor={selectedDays.includes(day) ? 'purple.500' : 'gray.200'}
                  color={selectedDays.includes(day) ? 'purple.500' : 'gray.500'}
                  borderWidth="1.5px"
                  borderRadius="lg"
                  disabled
                >
                  {day}
                </Button>
              ))}
            </HStack>
          </Box>
        </VStack>
      </CommonCard>

      {/* 참여자 리스트 */}
      <Text textStyle="title_md" mb={2}>
        참여자
      </Text>
      <VStack gap={3} align="stretch" mb={6}>
        {participants.map((p) => (
          <ProfileListItem
            key={p.name}
            name={p.name}
            statusMessage={p.desc}
          />
        ))}
      </VStack>

      {/* 버튼 2개 */}
      <HStack gap={4}>
        <DoubleButton
          leftLabel="초대하기"
          rightLabel="시작하기"
          onLeftClick={() => {
            // 초대 로직: 예시로 복사 또는 모달 띄우기
            console.log('초대하기 클릭')
          }}
          onRightClick={() => {
            navigate("/home") // 실제 roomId에 따라 변경
          }}
          mt={6}
        />
      </HStack>
    </Box>
  )
}

export default RoomWaitingPage
