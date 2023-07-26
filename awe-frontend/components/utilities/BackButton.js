import { useRouter } from 'next/router';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton(props) {
  const router = useRouter();

  return(
    <IconButton sx={{width: '40px', ml: '-10px'}} onClick={() => router.back()}>
      <ArrowBackIcon />
    </IconButton>
  )


}