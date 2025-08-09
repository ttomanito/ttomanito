// // MainLayout.tsx
// import { Box, Container } from '@chakra-ui/react';
// import { Outlet } from 'react-router-dom';
// import AppHeader from './AppHeader';

// export default function MainLayout() {
//   return (
//     <Box bg="#EAF4FF" h="100dvh" overflow="hidden">
//       {/* 3행(Grid): header / content / bottom-nav */}
//       <Container maxW="480px" px={4} h="100%" display="grid" gridTemplateRows="auto 1fr auto">
//         <AppHeader />

//         {/* 가운데만 스크롤 */}
//         <Box overflowY="auto">
//           <Outlet />
//         </Box>
//       </Container>
//     </Box>
//   );
// }
