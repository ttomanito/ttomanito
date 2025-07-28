// BasicLayout.tsx
import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <Box bg="yellow.50" h="100dvh" overflow="hidden">
      {/* 3행(Grid): header / content / bottom-nav */}
      <Container maxW="480px" px={4} h="100%" display="grid" gridTemplateRows="auto 1fr auto">
        <Box overflowY="auto">
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
