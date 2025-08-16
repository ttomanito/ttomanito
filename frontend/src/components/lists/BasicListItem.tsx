import { HStack, Text} from "@chakra-ui/react";
import type { StackProps } from '@chakra-ui/react';
import React from "react";

export interface BasicListItemProps extends StackProps {
  date: string;      // ex) "07.21"
  content: string;   // ex) "마니또가 탈퇴했어요"
}

const BasicListItem: React.FC<BasicListItemProps> = ({ date, content, ...rest }) => (
  <HStack 
    py={2} px={1} 
    align="start" 
    justify="flex-start"
    width="100%"
    {...rest}
  >
    <Text 
      textStyle="body_sm" minWidth="48px" 
      flexShrink={0}
    >
      {date}
    </Text>
    <Text 
      textStyle="body_sm" wordBreak="break-all"
    >
      {content}
    </Text>
  </HStack>
);

export default BasicListItem;
