import { Box, Text } from '@chakra-ui/react';

interface SectionHeaderProps {
  title: string;
  sub: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, sub }) => {
  return (
    <Box pt={4} pb={4} minHeight="124px">
      <Text textStyle="title_mlg">{title}</Text>
      <Text textStyle="caption_sm" color="gray.500">
        {sub}
      </Text>
    </Box>
  );
};

export default SectionHeader;
