import { IconButton } from '@chakra-ui/react';
import { LuArrowLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const BackButtonToMain = () => {
  const navigate = useNavigate();

  return (
    <IconButton aria-label="메인으로 가기" variant="ghost" onClick={() => navigate('/')}>
      <LuArrowLeft />
    </IconButton>
  );
};

export default BackButtonToMain;
