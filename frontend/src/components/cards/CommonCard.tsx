import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import React from 'react';

export interface CommonCardProps extends BoxProps {
  children: React.ReactNode;
}

const CommonCard: React.FC<CommonCardProps> = ({ children, ...rest }) => (
  <Box
    borderRadius="xl"
    boxShadow="sm"
    bg="white"
    p={6}
    width="100%"
    border="1px solid #F5F5F5"
    {...rest}
  >
    {children}
  </Box>
);

export default CommonCard;
