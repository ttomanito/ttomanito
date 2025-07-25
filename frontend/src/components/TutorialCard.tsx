import { useState } from "react"
import {
  Box,
  HStack,
  IconButton,
  Text,
  Image,
  VStack,
} from "@chakra-ui/react"
import FramedCard from "./ui/FramedCard"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

export type TutorialSlide = {
  title: string
  desc?: string
  image?: string
}

type TutorialCardProps = {
  accent?: string
  slides: TutorialSlide[]
}

const TutorialCard: React.FC<TutorialCardProps> = ({ accent = "#a4b8fbff", slides }) => {
  const [idx, setIdx] = useState(0)

  const prev = () => setIdx((p) => (p === 0 ? slides.length - 1 : p - 1))
  const next = () => setIdx((p) => (p === slides.length - 1 ? 0 : p + 1))

  const slide = slides[idx]

  return (
    <FramedCard accent={accent} header="튜토리얼">
      <HStack justify="space-between" mb={4}>
        <IconButton aria-label="prev" variant="ghost" onClick={prev}>
        <FaChevronLeft />
        </IconButton>
        <VStack flex={1} gap={2}>
          {slide.image && (
            <Image src={slide.image} alt={slide.title} boxSize="160px" objectFit="contain" />
          )}
          <Text fontWeight="bold">{slide.title}</Text>
          {slide.desc && (
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {slide.desc}
            </Text>
          )}
        </VStack>
        <IconButton aria-label="next" variant="ghost" onClick={next}>
        <FaChevronRight />
        </IconButton>
      </HStack>

      {/* dots */}
      <HStack justify="center" mt={2} gap={2}>
        {slides.map((_, i) => (
          <Box
            key={i}
            w={2.5}
            h={2.5}
            borderRadius="full"
            bg={i === idx ? accent : "gray.300"}
          />
        ))}
      </HStack>
    </FramedCard>
  )
}

export default TutorialCard
