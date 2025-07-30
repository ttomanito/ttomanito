import { Box, Text, Avatar } from '@chakra-ui/react';
import profile_bg from '@/assets/imgs/profile_bg.png';

interface ProfileCardProps {
  name: string;
  subtitle: string;
  title?: string;
  src?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, subtitle, title, src }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      p={4}
      bg="gray.50"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="gray.800"
      mb={4}
      bgSize={'cover'}
      bgImage={`url(${profile_bg})`}
      minHeight={'212px'}
    >
      {title && (
        <Text textStyle="title_md" mb={6}>
          {title}
        </Text>
      )}
      <Avatar.Root mb={2} size="2xl">
        <Avatar.Fallback name="?" />
        <Avatar.Image src={src} />
      </Avatar.Root>
      <Text textStyle="body_md">{name}</Text>
      <Text textStyle="caption_xs_light" color="gray.500">
        {subtitle}
      </Text>
    </Box>
  );
};

export default ProfileCard;
