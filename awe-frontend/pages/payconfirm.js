import NavbarLayout from '../layouts/Navbar'
import * as React from 'react';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Button, Typography, Box, Container } from '@mui/material';
import Router from 'next/router';
import Head from "next/head";

export default function PayConfirm() {
  return (
    <Container>
      <Head>
        <title>AWExpress - Payment</title>
        <meta name="payment"/>
        <link rel="icon" href="/favicon.ico?v=2"/>
      </Head>
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px', gap: '16px'}}>
        <CheckOutlinedIcon sx={{fontSize: '200px'}} />
        <Typography sx={{fontSize: '2rem', textAlign: 'center'}}>Your order has been placed successfully!</Typography>
        <Button variant='contained' onClick={() => {Router.push('/home')}}>Back to Home</Button>
        <Button variant='outlined' onClick={() => {Router.push('/order_history')}}>View Your Orders</Button>
      </Box>
    </Container>
  )
}

PayConfirm.getLayout = (page) => {
  return (
    <NavbarLayout>
      {page}
    </NavbarLayout>
  )
}