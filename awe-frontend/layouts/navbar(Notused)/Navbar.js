import { Icon } from '@iconify/react';
import menu2Fill from '@iconify/icons-eva/menu-2-fill';
import { styled } from '@mui/material/styles';
import {Box, Stack, AppBar, Toolbar, IconButton, Typography} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// import Searchbar from './Searchbar';
import AccountPopOver from './AccountPopOver';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 50;
const APPBAR_DESKTOP = 64;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',

}));

const UpperToolbarStyle = styled(Toolbar)(({ theme }) => ({
  '@media all': {minHeight: APPBAR_DESKTOP},
  backgroundColor: theme.palette.secondary.dark,
}));

const LowerToolbarStyle = styled(Toolbar)(({ theme }) => ({
  '@media all': {minHeight: APPBAR_DESKTOP - 30},
  backgroundColor: theme.palette.secondary.main,
}));

// ----------------------------------------------------------------------

export default function DashboardNavbar({ onOpenSidebar }) {
  const theme = useTheme();

  return (
    <RootStyle>
      <UpperToolbarStyle>
        <Typography variant="h6" color={theme.palette.secondary.contrastText}>AWExpress</Typography>



        {/*<Searchbar />*/}
        {/*<Box sx={{ flexGrow: 1 }} />*/}

        {/*<Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>*/}
        {/*  <AccountPopOver />*/}
        {/*</Stack>*/}
      </UpperToolbarStyle>
      <LowerToolbarStyle>
        <IconButton onClick={onOpenSidebar} sx={{ mr: 1, color: theme.palette.secondary.contrastText }}>
          <Icon icon={menu2Fill} />
        </IconButton>
      </LowerToolbarStyle>
    </RootStyle>
  );
}