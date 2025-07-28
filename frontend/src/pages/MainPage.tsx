import React from "react"
import {
  Box,
  Container,
  HStack,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import CustomButton from "@/components/ui/CustomButton"
import TutorialCard from "@/components/TutorialCard"
import type { TutorialSlide } from "@/components/TutorialCard"
import logo from "@/assets/logo.svg" 

const color = "#a4b8fbff"

const slides: TutorialSlide[] = [
  {
    title: "하루에 한 번, 미션을 수행해요!",
    desc: "미션은 총 7일 동안 진행돼요.",
    image: "/assets/tutorial-1.svg",
  },
  {
    title: "마니또에게 들키지 않게!",
    desc: "몰래 과자 선물하기 같은 재미있는 미션들이 준비돼 있어요.",
    image: "/assets/tutorial-2.svg",
  },
  {
    title: "완료 후 결과 확인",
    desc: "마지막 날엔 결과 보고서를 받아요.",
    image: "/assets/tutorial-3.svg",
  },
]

const MainPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Container maxW="480px" px={4} pt={6}>
      {/* ===== 앱 로고 & 타이틀 ===== */}
      <Box textAlign="center" mb={6}>
        <HStack justify="center" align="center" gap={4}>
          <Image src={logo} boxSize="32px" alt="로고" />
          <Text fontSize="3xl" fontWeight="bold">
            또마니또
          </Text>
          <Image src={logo} boxSize="32px" alt="로고" />
        </HStack>
        <Text fontSize="sm" color="gray.500" mt={1}>
          마니또 보조 어플
        </Text>
      </Box>

      {/* Tutorial 카드 */}
      <TutorialCard accent={color} slides={slides} />

      {/* 메인 액션 버튼들 */}
      <Stack gap={3} mt={6} pb={6}>
        <CustomButton w="full" accent={color} onClick={() => navigate("/room")}>
          방 만들기
        </CustomButton>
        <CustomButton w="full" accent={color} onClick={() => navigate("/report/reportlist")}>
          결과 확인하러가기
        </CustomButton>
      </Stack>
    </Container>
  )
}

export default MainPage
