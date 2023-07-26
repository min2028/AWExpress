import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/router";
import axios from "axios";
// import { Outlet } from 'react-router-dom';
// material
import { styled, useTheme } from '@mui/material/styles';

//
import Navbar from './Navbar';
import Sidebar from './Sidebar';


// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: 5,
}));

// ----------------------------------------------------------------------

export default function NavbarLayout({children}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  // if(typeof window !== 'undefined' && !isAuthenticated) {
  //   router.push('/login');
  // }

  return (
    <RootStyle>
      <Navbar onOpenSidebar={() => setOpen(true)}/>
      {/*<Sidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)}/>*/}
      <MainStyle>
        {children}
      </MainStyle>
    </RootStyle>

  );
}