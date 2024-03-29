import Head from "next/head";
import {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, Stack, Button, Typography, Backdrop} from "@mui/material";
import Loader from "../components/utilities/loader";
import {useSession, signIn, signOut} from 'next-auth/react';
import {Icon} from '@iconify/react';
import googleFill from '@iconify/icons-eva/google-fill';
import {useRouter} from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {login, logout} from "../actions/auth";

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const {data: session, status} =  useSession();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (status === 'authenticated' && user != null) {
      router.replace("/home")
    } else if (status !== 'authenticated' && user != null) {
      dispatch(logout());
    } else if (status === 'authenticated' && user == null) {
      setLoading(true);
      dispatch(login(session.user.email, session.id_token, setSubmitted, setError));
    }
  }, [status, user])

  useEffect(() => {
    if (error) {
      console.log("Could not sign into AWEexpress server")
      dispatch(logout());
      signOut({redirect: false}).then(() => setLoading(false));
    }
  }, [error])

  const signin = () => {
    setError(false);
    signIn('google');
  }

  return (
    <>
      <Head>
        <title>AWExpress - Login</title>
        <meta name="login" content="Generated by create next app"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      {loading &&
        <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
        <Typography variant="subtitle2" color={theme.palette.secondary.main} sx={{mt: 0.5}}>Signing in</Typography>
        <Loader size={10} color={theme.palette.secondary.main}/>
        </Backdrop>
      }

      <Box sx={{
        width: '100%',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            height: '40%',
            backgroundColor: theme.palette.secondary.main
        }}>
          <Stack direction="row">
            <Typography variant='h1' color={theme.palette.primary.light} 
              sx={{
                pt: 1, 
                mb: '2%', 
                fontSize: 50,
                [theme.breakpoints.down('loginLogoText')]: {
                  fontSize: 30
                },
              }}>
              AW
            </Typography>
            <Typography variant='h1' color={theme.palette.background.main} 
              sx={{
                mb: '2%', 
                fontSize: 100,
                [theme.breakpoints.down('loginLogoText')]: {
                  fontSize: 60
                },
              }}>
              Express
            </Typography>
          </Stack>
        </Box>

        <Stack direction="column" spacing={2} alignItems="center" sx={{width: 'inherit', mt: '2%'}}>
          <Button size="large"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    minWidth: '20%',
                    height: '65px'}}
                  onClick={signin}

          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant='subtitle2'>
                Sign in with Google
              </Typography>
              <Icon icon={googleFill} color="#DF3E30" height={35}/>
            </Stack>
          </Button>
          {error && <Typography variant="subtitle1" color={theme.palette.error.main}>Could not access AWExpess database.  Please try again</Typography>}
        </Stack>
      </Box>
    </>
  )
}