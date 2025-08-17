import { forwardRef } from 'react';
import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

type CustomButtonProps = Omit<ButtonProps, 'variant' | 'colorScheme'> & {
  accent?: string;
};

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, w = '50%', accent = '#a4b8fbff', ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        w={w}
        size="lg"
        border="2px solid"
        borderColor={accent} // accent를 상단에서 받는 prop으로 설정
        borderRadius="full"
        bg="white" // 배경 없이
        color="black"
        boxShadow="md" // FramedCard와 동일
        _hover={{ bg: 'gray.50' }}
        _active={{ bg: 'gray.100' }}
        _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

CustomButton.displayName = 'CustomButton';
export default CustomButton;
