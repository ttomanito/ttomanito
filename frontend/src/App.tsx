// src/App.tsx
// 리액트 + 타입스크립트 예시

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

const App: React.FC = () => {
  return (
    <Box bg="gray.50" minH="100vh">
      {/* ===== 헤더 ===== */}
      <Box bg="white" boxShadow="sm">
        <Container maxW="container.xl" py={4}>
          <Flex align="center" justify="space-between">
            <Heading size="md">MyChakraApp</Heading>
            <Button
              as="a"
              // href="https://github.com"
              // leftIcon={<Icon as={FaGithub} />}
              variant="outline"
              size="sm"
            >
              GitHub
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* ===== 본문 ===== */}
      <Container maxW="container.lg" py={16}>
        {/* <VStack spacing={6} textAlign="center"> */}
          <Heading size="2xl">Welcome to MyChakraApp</Heading>
          <Text fontSize="lg" color="gray.600">
            Chakra UI로 빠르게 반응형 사이트를 만들어 보세요.
            <br />
            TypeScript 덕분에 컴포넌트 속성도 안전하게!
          </Text>

          <Flex gap={4} flexDir={{ base: "column", md: "row" }}>
            <Button color="gray.600" size="lg">
              시작하기
            </Button>
            <Button variant="outline" size="lg">
              문서 살펴보기
            </Button>
          </Flex>
        {/* </VStack> */}
      </Container>

      {/* ===== 푸터 ===== */}
      <Box bg="gray.800" color="gray.200" py={8} mt="auto">
        <Container maxW="container.xl" textAlign="center">
          <Text fontSize="sm">
            © {new Date().getFullYear()} MyChakraApp. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default App;
