import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import {useSelector} from 'react-redux';
import {useTheme} from "@mui/material/styles";
import {Backdrop, Box, Divider, Stack, Typography} from '@mui/material';
import NavbarLayout from "../layouts/Navbar";
import PendingOrder from "../components/orders/PendingOrder";
import BackButton from "../components/utilities/BackButton";
import Link from "next/link";
import Loader from "../components/utilities/loader";
import Head from "next/head";

const FAKE_ORDERS = [
  {
    orderId: 123,
    productId: 22,
    productName: 'apple',
    productPrice: '23.39',
    productPicture: 'url',
    quantity: 3,
    shipAddress: {
      street: "123 Easy St",
      city: "Vancouver",
      postal: "A1B2C3",
      province: "British Columbia"
    }
  },
  {
    orderId: 123,
    productId: 23,
    productName: 'Banana',
    productPrice: '11.50',
    productPicture: 'url',
    quantity: 5,
    shipAddress: {
      street: "123 Easy St",
      city: "Vancouver",
      postal: "A1B2C3",
      province: "British Columbia"
    }
  },
  {
    orderId: 128,
    productId: 55,
    productName: 'Super Long Title T-Shirt Blah blah blah',
    productPrice: '59.49',
    productPicture: 'url',
    quantity: 2,
    shipAddress: {
      street: "123 Hard St",
      city: "Vancouver",
      postal: "A1B2C3",
      province: "Alberta"
    }
  }
]

function transformData(itemArray) {
  let orders = {}
  for (const item of itemArray) {
    if (!(`${item.orderId}` in orders)) orders[`${item.orderId}`] = [];
    orders[`${item.orderId}`].push(item);
  }
  return orders;
}

export default function PendingOrders () {
  const theme = useTheme();
  const {data: session, status} = useSession();
  const user = useSelector(state => state.auth.user);

  // Hash of Arrays, Keys = order IDs, value = array of products
  const [orders, setOrders] = useState({});
  const [noItems, setNoItems] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(
      `/api/user/${user.userId}/sellorder`,
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        if (response.data.orderItems.length === 0) {
          setNoItems(true);
        } else {
          setOrders(transformData(response.data.orderItems))
        }

        setLoading(false)
      }
    }).catch((err) => {
      setLoading(false);
      console.log(`Error retrieving your orders with error ${err.response.data}`);
    })
  }, [])

  // useEffect(() => {
  //   setOrders(transformData(FAKE_ORDERS))
  //   setLoading(false)
  // }, [])

  if (loading) {
    return(
      <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
        <Loader size={10} color={theme.palette.secondary.main}/>
      </Backdrop>
    )
  } else {
    return (
      <>
        <Head>
          <title>AWExpress - Order Requests</title>
          <meta name="order requests"/>
          <link rel="icon" href="/favicon.ico?v=2"/>
        </Head>
        <Stack direction="column" sx={{ml: '10%', mr: '10%'}}>
          <BackButton />
          <Typography variant='h3' sx={{color: theme.palette.secondary.main, mb: '-5px'}}>Your Order Requests</Typography>
          <Typography variant='h6' sx={{ml: '3px', mb: '50px'}}>View customer orders waiting to be shipped</Typography>
          {noItems &&
            <Typography variant='h4' sx={{mt: '50px', ml: 'auto', mr: 'auto'}}> You do not have any order requests...</Typography>
          }
          {!noItems &&
            <Box sx={{maxWidth: '100%', ml: '5%', mr: '5%'}}>
              <Stack direction='column' spacing={5} sx={{width: '100%', alignItems: 'center'}}>
                {!loading && Object.keys(orders).map((key, index) => (
                  <PendingOrder key={index} orderId={key} items={orders[`${key}`]}/>
                ))}
              </Stack>
            </Box>
          }
        </Stack>
      </>
    )
  }
}

PendingOrders.getLayout = (page) => {
  return (
    <NavbarLayout>
      {page}
    </NavbarLayout>
  )
}

