import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Backdrop, Box, Divider, Stack, Typography } from '@mui/material';
import NavbarLayout from '../layouts/Navbar';
import OrderHistory from '../components/orders/OrderHistory';
import BackButton from '../components/utilities/BackButton';
import Loader from '../components/utilities/loader';
import Head from "next/head";

export default function Order_history() {
    const theme = useTheme();
    const { data: session, status } = useSession();
    const user = useSelector((state) => state.auth.user);

    // Hash of Arrays, Keys = order IDs, value = array of products
    const [orders, setOrders] = useState(null);
    const [noOrders, setNoOrders] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`/api/user/${user.userId}/orderhistory`, {
                headers: {
                    'Content-Type': 'application/json',
                    authorization: session.id_token,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data.orders.length === 0) {
                        setNoOrders(true);
                    } else {
                        setLoading(false);
                        setOrders(response.data.orders.reverse());
                    }
                }
            })
            .catch((err) => {
                setLoading(false);
                setNoOrders(true);
                console.log(
                    `Error retrieving your orders with error ${JSON.stringify(
                        err.response.data
                    )}`
                );
            });
    }, []);

    if (loading) {
        return (
            <Backdrop
                open={true}
                sx={{ backgroundColor: 'rgb(255, 255, 255, 0.6)', zIndex: 99 }}
            >
                <Loader size={10} color={theme.palette.secondary.main} />
            </Backdrop>
        );
    } else if (!loading && noOrders) {
        return (
          <>
              <Head>
                  <title>AWExpress - Home</title>
                  <meta name="home"/>
                  <link rel="icon" href="/favicon.ico?v=2"/>
              </Head>
            <Stack
                direction='column'
                spacing={5}
                sx={{ height: '30vh', width: '70%', mr: 'auto', ml: 'auto' }}
            >
                <BackButton />
                <Box>
                    <Typography
                        sx={{
                            fontSize: '2rem',
                            position: 'relative',
                            left: '32px',
                        }}
                    >
                        You do not have any orders...
                    </Typography>
                </Box>
            </Stack>
          </>
        );
    } else {
        return (
          <>
              <Head>
                  <title>AWExpress - Order History</title>
                  <meta name="order history"/>
                  <link rel="icon" href="/favicon.ico?v=2"/>
              </Head>
            <Box sx={{ maxWidth: '100%', ml: '15%', mr: '15%' }}>
                <Box>
                    <BackButton />
                    <Typography
                        variant='h3'
                        sx={{ color: theme.palette.secondary.main, mb: '5%' }}
                    >
                        Your Orders
                    </Typography>
                </Box>
                <Stack
                    direction='column'
                    spacing={5}
                    sx={{ width: '100%', alignItems: 'center' }}
                >
                    {!loading &&
                        orders &&
                        orders.map((order, index) => (
                            <OrderHistory
                                key={index}
                                orderId={order.orderId}
                                status={order.status}
                                shipAddress={order.shipAddress}
                                items={order.items}
                            />
                        ))}
                </Stack>
            </Box>
          </>
        );
    }
}

Order_history.getLayout = (page) => {
    return <NavbarLayout>{page}</NavbarLayout>;
};
