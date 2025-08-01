import { Input } from '@chakra-ui/react';
import { forwardRef } from 'react';

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const DateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <Input
      onClick={onClick}
      ref={ref}
      value={value}
      placeholder={placeholder}
      readOnly
      w="full"
      h="36px"
      borderRadius="xl"
      borderColor="gray.300"
      textStyle="body_md"
      bg="white"
      _placeholder={{ color: 'gray.400' }}
      _focus={{
        borderColor: 'purple.500',
        boxShadow: '0 0 0 1px #B794F4',
      }}
    />
  )
);

export default DateInput;
