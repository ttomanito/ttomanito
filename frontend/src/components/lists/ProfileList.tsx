import { VStack } from '@chakra-ui/react';
import ProfileListItem from './ProfileListItem';

interface Profile {
  name: string;
  statusMessage: string;
  profileImageUrl?: string;
}

interface ProfileListProps {
  data: Profile[];
}

const ProfileList: React.FC<ProfileListProps> = ({ data }) => {
  if (data.length === 0) {
    return <div>표시할 프로필이 없습니다.</div>;
  }

  return (
    <VStack>
      {data.map((profile, index) => (
        <ProfileListItem key={index} {...profile} />
      ))}
    </VStack>
  );
};

export default ProfileList;
