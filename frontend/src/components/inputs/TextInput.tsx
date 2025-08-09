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
      bg="white"
      borderRadius="xl"
      borderColor="gray.300"
      textStyle="caption_xs_light" // ✅ 여기에 적용!
      _placeholder={{ color: 'gray.400' }}
      _focus={{
        borderColor: 'blue.300',
        boxShadow: '0 0 0 1px #A4B8FB',
      }}
    />
  );
};

export default TextInput;
