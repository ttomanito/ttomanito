import { Input } from '@chakra-ui/react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      w="full"
      h="36px"
      fontSize="sm"
      bg="white"
      borderRadius="md"
      borderColor="gray.300"
      _placeholder={{ color: 'gray.400' }}
      _focus={{
        borderColor: 'blue.300',
        boxShadow: '0 0 0 1px #A4B8FB',
      }}
    />
  );
};

export default TextInput;
