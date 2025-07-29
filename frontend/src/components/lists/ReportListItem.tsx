import { Flex, Text } from '@chakra-ui/react';

export interface ReportListItemProps {
  label: string;
  value: string;
}

const ReportListItem: React.FC<ReportListItemProps> = ({ label, value }) => {
  return (
    <Flex justify="space-between" align="center" py="8px" px="16px" w="100%">
      <Text fontSize="sm" color="gray.700">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.900" fontWeight="medium">
        {value}
      </Text>
    </Flex>
  );
};

export default ReportListItem;
