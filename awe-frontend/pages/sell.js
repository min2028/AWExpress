import NavbarLayout from '../layouts/Navbar'
import SellForm from '../components/forms/SellForm'
import {Box, Container, List, ListItem, Divider, Typography, Button, TextField, Backdrop, Stack} from '@mui/material';
import { useState, useEffect } from 'react';
import {useSelector} from 'react-redux';
import { useSession } from 'next-auth/react';
import axios from "axios";
import {useTheme} from "@mui/material/styles";
import Loader from "../components/utilities/loader";
import Link from 'next/link';
import BackButton from "../components/utilities/BackButton"
import Head from "next/head";

export default function Sell() {
  const theme = useTheme();
  const {data: session, status} = useSession();
  const user = useSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(
      `/api/user/${user.userId}/deposit`,
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      const depositInfo = response.data.deposit
      if (
        depositInfo
        && depositInfo.institutionNumber !== ""
        && depositInfo.transitNumber !== ""
        && depositInfo.accountNumber !== "") {
        axios.get(
          `/api/user/${user.userId}`,
          {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
        ).then((response) => {
          const thisUser = response.data;
          if (
            thisUser &&
            thisUser.department &&
            thisUser.firstname && thisUser.firstname !== '' &&
            thisUser.lastname && thisUser.lastname !== '' &&
            thisUser.address &&
            thisUser.address.street && thisUser.address.street !== '' &&
            thisUser.address.city && thisUser.address.city !== '' &&
            thisUser.address.postal && thisUser.address.city !== '' &&
            thisUser.address.province && thisUser.address.province !== '') {
            setVerified(true)
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch((err) => {
      console.log(`Error in getting user deposit info with error ${JSON.stringify(err.response)}`);
      setLoading(false)
    })
  }, []);

  if (loading) {
    return (
      <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
        <Loader size={10} color={theme.palette.secondary.main}/>
      </Backdrop>
    )
  } else if (!loading && !verified) {
    return (
      <>
        <Head>
          <title>AWExpress - Sell an Item</title>
          <meta name="sell an item"/>
          <link rel="icon" href="/favicon.ico?v=2"/>
        </Head>
        <Stack direction="column" spacing={5} sx={{height:'30vh', ml: '10%', mr: '10%'}}>
          <BackButton />
          <Typography variant='h4'> Oops!  It looks like you have not completed your account information...</Typography>
          <Link href='/profile'>
            <Typography
              variant='h6'
              sx={{textDecoration: 'underline', color: 'darkblue'}}
            >
              Please complete your profile information (including deposit information) here before you can sell!
            </Typography>
          </Link>
        </Stack>
      </>
    )
  } else {
    return (
      <Container>
        <Head>
          <title>AWExpress - Sell an Item</title>
          <meta name="sell an item"/>
          <link rel="icon" href="/favicon.ico?v=2"/>
        </Head>
        <Box sx={{ml: '5%', mb: '1%'}}>
          <BackButton />
        </Box>
        {productLoading &&
          <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
            <Typography variant="subtitle2" color={theme.palette.secondary.main} sx={{mt: 0.5}}>Posting Product</Typography>
            <Loader size={10} color={theme.palette.secondary.main}/>
          </Backdrop>
        }
          <SellForm id_token={session.id_token} setProductLoading={setProductLoading}/>
      </Container>
    )
  }
}

Sell.getLayout = (page) => {
    return ( 
      <NavbarLayout>
        {page}
      </NavbarLayout>
    )
  }