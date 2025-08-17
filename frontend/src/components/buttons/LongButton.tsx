// LongButton.tsx

import { forwardRef } from 'react';

import { Button } from '@chakra-ui/react';

import type { ButtonProps } from '@chakra-ui/react';

export type LongButtonProps = Omit<ButtonProps, 'variant' | 'colorScheme'>;

const LongButton = forwardRef<HTMLButtonElement, LongButtonProps>(({ children = '확인', ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      w="full"
      size="lg"
      borderRadius="full"
      bg="accent.500"
      color="black"
      textStyle="body_sm"
      border="1px solid gray.500"
      boxShadow="0px 2px 4px rgba(0, 0, 0, 0.2)"
      rounded="xl"
      _hover={{ bg: 'accent.600' }}
      _active={{ bg: 'accent.700' }}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      {...rest}
    >
      {children}
    </Button>
  );
});

LongButton.displayName = 'LongButton';

export default LongButton;
