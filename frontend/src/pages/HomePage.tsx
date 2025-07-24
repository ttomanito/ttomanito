// HomePage.tsx

import CustomButton from "@/components/ui/CustomButton" 
import React from "react"
import {
  Box,
  Text,
  VStack,
  Stack,
  Icon,
  Progress,
  Flex,
  Image,
  Container,
  Card,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FaBell, FaCheckCircle, FaCrown, FaCog } from "react-icons/fa"

const TOTAL_MISSIONS = 7
const COMPLETED_MISSIONS = 5
const color = "#a4b8fbff"
const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const progressValue = (COMPLETED_MISSIONS / TOTAL_MISSIONS) * 100

  return (
    <Box bg ="#EAF4FF" minH="100vh" pb={8} overflowX="hidden">
      <Container maxW="480px" px={4}>
        {/* Header */}
        <Flex as="header" align="center" justify="space-between" pt={2} mb={2}>
          <Image src="/icons/logo.svg" h="50px" alt="logo" />

          <Flex gap={4}>
            <Icon as={FaBell} boxSize={6} color="black" />
            <Icon as={FaCog} boxSize={6} color="black" />
          </Flex>
        </Flex>
        {/* Page Title */}
        <VStack gap={3} textAlign="center" mt={4}>
          <Icon as={FaCrown} boxSize={6} />
        </VStack>

        {/* Mission Card */}
        <Card.Root
          mt={3}
          w="full"
          bg="white"
          rounded="md"
          overflow="hidden"
          border="2px solid"
          borderColor={color}
          boxShadow="sm"
          textAlign="center"
        >
          {/* 컬러 헤더 */}
          <Card.Header bg={color} color="black" py={0} px={4}>
          <Text fontSize="3xl" fontWeight="bold" py = {2}>
            오늘의 미션
          </Text>
          </Card.Header>

          {/* 본문 */}
          <Card.Body p={6}>
            <Text fontWeight="bold" fontSize="lg" mb={1}>
              몰래 과자 선물하기!!
            </Text>
            <Text fontSize="sm" color="gray.600">
              내 마니또에게 들키지 않고 선물을 전해주세요
            </Text>

            <Image
              src="/assets/bread.svg"
              alt="bread icon"
              boxSize="120px"
              mx="auto"
              mt={6}
              mb={2}
            />
          </Card.Body>

          {/* 필요하면 */}
          {/* <Card.Footer p={4}>
            <CustomButton w="full">미션 완료!</CustomButton>
          </Card.Footer> */}
        </Card.Root>
        
        {/* Mission Card
        
        <Box bg="white" mt={6} borderRadius="md" p={6} textAlign="center" boxShadow="sm" w="full">
          
          
          <Text fontWeight="bold" fontSize="lg" mb={1}>
            몰래 과자 선물하기!!
          </Text>
          <Text fontSize="sm" color="gray.600">
            내 마니또에게 들키지 않고 선물을 전해주세요
          </Text>

          <Image src="/assets/bread.svg" alt="bread icon" boxSize="120px" mx="auto" mt={6} mb={2} />
        </Box> */}

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
        <Stack gap={4} mt={6}>
          {[
            {
              title: "이전 미션 목록 보기",
              description: "그동안 수행했던 미션을 확인 할 수 있어요.",
            },
            {
              title: "튜토리얼 보기",
              description: "도마니또 이용 방법을 알 수 있어요.",
            },
          ].map(({ title, description }) => (
            <Flex key={title} align="center" bg="white" p={4} borderRadius="md" boxShadow="sm" w="full" gap={4}>
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

        {/* Mission Complete Button */}
        <CustomButton mt={8} w="full" onClick={() => navigate("/")}>
          미션 완료!
        </CustomButton>
      </Container>
    </Box>
  )
}

export default HomePage
