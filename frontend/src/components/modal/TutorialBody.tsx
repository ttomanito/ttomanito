import {
  Text,
  VStack,
  Box,
  HStack,
  IconButton,
  Image,
  DialogTitle,
  DialogHeader,
} from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import iconPresent from "@/assets/tutorial_icons/ttoma_present.svg";
import iconMission from "@/assets/tutorial_icons/ttoma_mission.svg";
import iconChat from "@/assets/tutorial_icons/ttoma_chat.svg";
import iconGuessing from "@/assets/tutorial_icons/ttoma_guessing.svg";

const tutorialData = [
  {
    title: "마니또 & 마니띠, 뭐예요?",
    description: "마니또는 몰래 누군가를 챙겨주는 비밀 친구예요.\n마니띠는 누구냐구요?\n마니또의 마음을 받는 주인공이죠!",
    image: iconPresent,
  },
  {
    title: "랜덤 매칭 & 특별 미션",
    description: "마니또 마니띠는 랜덤으로 매칭돼요.\n정해진 날짜에만 열리는 미션!\n그 날만큼은 마니띠에게 더 따뜻한 마음을 전해보세요 💌",
    image: iconMission,
  },
  {
    title: "익명 소통의 즐거움",
    description: "익명으로 말을 걸어보세요.\n1:1 익명 채팅이 가능해요.",
    image: iconChat,
  },
  {
    title: "추측과 결과의 시간",
    description: "매일 “누가 나의 마니또였을까?”\n추측에 도전하세요 !\n마니또 중간 순위와 최종 리포트도 확인할 수 있어요.",
    image: iconGuessing,
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

const TutorialBody = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleChange = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0 || next >= tutorialData.length) return prev;
      return next;
    });
  };

  const { title, description, image } = tutorialData[index];

  return (
    <Box w="full">
      <Box pos="relative" w="full">
        <IconButton
          aria-label="이전"
          position="absolute"
          top="50%"
          left={-4}
          transform="translateY(-50%)"
          onClick={() => handleChange(-1)}
          disabled={index === 0}
          variant="ghost"
          zIndex="docked"
        >
          <FiArrowLeft />
        </IconButton>
        <IconButton
          aria-label="다음"
          position="absolute"
          top="50%"
          right={-4}
          transform="translateY(-50%)"
          onClick={() => handleChange(1)}
          disabled={index === tutorialData.length - 1}
          variant="ghost"
          zIndex="docked"
        >
          <FiArrowRight />
        </IconButton>

        <Box w="full" overflow="hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const offset = info.offset.x;
                if (offset > 80 && index > 0) {
                  handleChange(-1);
                } else if (offset < -80 && index < tutorialData.length - 1) {
                  handleChange(1);
                }
              }}
            >
              <VStack w="full" gap={4}>
                <DialogHeader flexDir="column" textAlign="center" w="full">
                  <DialogTitle textAlign="center" w="full">
                    {title}
                  </DialogTitle>
                </DialogHeader>
                <VStack gap={4} px={6}>
                  <Image src={image} boxSize="200px" mx="auto" />
                  <Text whiteSpace="pre-line" textStyle="body_sm" color="gray.700">
                    {description}
                  </Text>
                  <HStack justify="center">
                    {tutorialData.map((_, i) => (
                      <Box
                        key={i}
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={i === index ? "accent.500" : "gray.300"}
                      />
                    ))}
                  </HStack>
                </VStack>
              </VStack>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default TutorialBody;