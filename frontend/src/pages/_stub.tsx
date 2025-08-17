import { Center, Heading, Text, VStack } from '@chakra-ui/react';

/** 페이지 이름만 크게 보여주는 더미 컴포넌트를 만들어 줍니다. */
export const createStubPage = (name: string) => () => (
  <Center h="100vh" bg="gray.50">
    <VStack gap={2}>
      <Heading size="lg">{name}</Heading>
      <Text color="gray.500">dummy page</Text>
    </VStack>
  </Center>
);
