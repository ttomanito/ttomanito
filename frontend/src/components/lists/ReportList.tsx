import { VStack } from '@chakra-ui/react';
import ReportListItem from './ReportListItem';
import type { ReportListItemProps } from './ReportListItem';
interface ReportListProps {
  data: ReportListItemProps[];
}

const ReportList: React.FC<ReportListProps> = ({ data }) => {
  return (
    <VStack>
      {data.map((item, index) => (
        <ReportListItem key={index} label={item.label} value={item.value} />
      ))}
    </VStack>
  );
};

export default ReportList;
