import NavbarLayout from '../layouts/Navbar';
import CartItem from '../components/CartItem';
import {Button, Divider, Typography, Box, Container, useTheme, Backdrop} from '@mui/material';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import BackButton from '../components/utilities/BackButton';
import { useDispatch } from 'react-redux';
import {updateAllAmounts} from '../actions/amounts';
import Loader from "../components/utilities/loader";

let shopping_cart_quantity;
export default function Cart() {
    const theme = useTheme();
    const { data: session, status } = useSession();
    const user = useSelector((state) => state.auth.user);
    const amounts = useSelector(state => state.amounts);

    const [initialCart, setInitialCart] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [shippingCost, setShippingCost] = useState(-1);
    const [updateCart, setUpdateCart] = useState(0);
    const [loading, setLoading] = useState(true);



    const cartQty = amounts.cartItems;
    const orderQty = amounts.orderItems;
    const listingQty = amounts.listingItems;
    const sellerPendingQty = amounts.pendingItems;

    useEffect(() => {
        setLoading(true);
        let subTotalCounter = 0;
        if (status === 'authenticated') {
            axios
                .get(`/api/user/${user.userId}/cart/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: session.id_token,
                    },
                })
                .then((response) => {
                    let shopping_cart_items = [];
                    response.data['items'].map((res_item) => {
                        shopping_cart_items.push({
                            productId: res_item['productId'],
                            productName: res_item['productName'],
                            description: res_item['description'],
                            price: res_item['price'],
                            quantity: res_item['quantity'],
                            picture: res_item['picture'],
                            availableQuantity: res_item['availableQuantity'],
                        });
                        subTotalCounter =
                            subTotalCounter +
                            res_item['price'] * res_item['quantity'];
                    });
                    shopping_cart_quantity = shopping_cart_items.length;
                    setInitialCart(shopping_cart_items);
                    setSubTotal(subTotalCounter);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(`Error in getting cart info with error ${JSON.stringify(err.response)}`);
                    setLoading(false);
                });
        } else {
            setInitialCart([]);
        }
    }, [cartQty, amounts.cartUpdateListener]);
    return (
        <>
            <Head>
                <title>AWExpress - Shopping Cart</title>
                <meta
                    name='Shopping Cart'
                />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            {loading &&
              <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
                  <Loader size={10} color={theme.palette.secondary.main}/>
              </Backdrop>
            }
            {!loading &&
              <Container>
                  <BackButton/>
                  <Typography variant="h4" sx={{fontWeight: 'bold', color: theme.palette.secondary.main}}>
                      Your Cart
                  </Typography>
                  <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between ',
                        [theme.breakpoints.down('cartPriceDisplay')]: {
                            flexDirection: 'column-reverse'
                        }
                    }}
                  >
                      <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                        }}
                      >

                          {/* <Typography variant="h4" sx={{fontWeight: 'bold', color: theme.palette.secondary.main}}>
                              Your Cart
                          </Typography> */}
                          {initialCart.length === 0 && (
                            <Typography
                              sx={{
                                  fontSize: '2rem',
                                  position: 'relative',
                                  ml: 'auto',
                                  mr: 'auto',
                              }}
                            >
                                You do not have any items in your cart
                            </Typography>
                          )}
                          {initialCart.length === 0 ? null :
                          <>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: theme.palette.secondary.main}}>
                              Your Cart
                            </Typography>
                            <Box sx={{bgcolor: 'white', borderRadius: '5px', p: '15px', mt: '65px', mr: '20px'}}>
                                {initialCart.map((item, key) => (
                                    <Box key={key} sx={{display: 'flex'}}>
                                        <CartItem
                                        cartKey={key}
                                        productId={item['productId']}
                                        productName={item['productName']}
                                        description={item['description']}
                                        price={item['price']}
                                        quantity={item['quantity']}
                                        picture={item['picture']}
                                        availableQuantity={
                                            item['availableQuantity']
                                        }
                                        userId={user.userId}
                                        sessionIdToken={session.id_token}
                                        setUpdateCart={setUpdateCart}
                                        updateCart={updateCart}
                                        />

                                    </Box>
                                ))}
                            </Box>
                          </>
                          }
                      </Box>

                      <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '250px',
                            mt: '65px',
                            gap: '16px',
                            p: '10px',
                            borderRadius: '5px',
                            bgcolor: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                sx={{ fontSize: '1rem', width: '6rem' }}
                            >
                                Subtotal:
                            </Typography>
                            <Typography sx={{ fontSize: '1rem' }}>
                                ${subTotal.toFixed(2)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                sx={{ fontSize: '1rem', width: '6rem' }}
                            >
                                Taxes:
                            </Typography>
                            <Typography sx={{ fontSize: '1rem' }}>
                                TBD
                                {/* ${(subTotal * 0.12).toFixed(2)} */}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                sx={{ fontSize: '1rem', width: '6rem' }}
                            >
                                Shipping:
                            </Typography>
                            <Typography sx={{ fontSize: '1rem' }}>
                                {shippingCost < 0 ? 'TBD' : '$' + shippingCost}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                sx={{ fontSize: '1rem', width: '6rem' }}
                            >
                                Total:
                            </Typography>
                            <Typography sx={{ fontSize: '1rem' }}>
                                $
                                {(
                                    subTotal +
                                    // subTotal * 0.12 +
                                    (shippingCost < 0 ? 0 : shippingCost)
                                  ).toFixed(2)}
                              </Typography>
                          </Box>
                          {initialCart.length === 0 ? (
                            <Button variant='contained' disabled={true}>
                                Checkout
                            </Button>
                          ) : (
                            <Button
                              variant='contained'
                              sx={{
                                  backgroundColor: theme.palette.secondary.main,
                                  color: theme.palette.secondary.contrastText,
                                  '&:hover': {
                                      backgroundColor: theme.palette.secondary.light,
                                  }
                              }}
                              onClick={() => {
                                  Router.push('/checkout');
                              }}
                            >
                                Checkout
                            </Button>
                          )}
                      </Box>
                  </Box>
              </Container>
            }
        </>
    );
}

Cart.getLayout = (page) => {
    return (
        <NavbarLayout shoppingcart={shopping_cart_quantity}>
            {page}
        </NavbarLayout>
    );
};
