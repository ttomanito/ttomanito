import { Center, VStack, Image, Spinner, Text } from '@chakra-ui/react'
import logo from '@/assets/logo.svg'

export default function Splash() {
  return (
    <Center h="100dvh" bg="white">
      <VStack gap={4}>
        <Image src={logo} alt="TTOMANITO" boxSize="80px" />
        <Spinner size="lg" borderWidth="4px" color="accent.500" animationDuration="0.8s" />
        <Text color="gray.500">잠시만 기다려 주세요…</Text>
      </VStack>
    </Center>
  )
}
