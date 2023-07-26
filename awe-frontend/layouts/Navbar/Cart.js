import { useState } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  CssBaseline,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText, Typography, Badge, Button, Backdrop, Stack
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import SellIcon from '@mui/icons-material/Sell';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CartDrawerItem from '../../components/CartDrawerItem';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 400;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerRight(props) {
  const theme = useTheme();
  const router = useRouter();
  const user = useSelector(state => state.auth.user);
  const [updateCart, setUpdateCart] = useState(0);
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
        <Backdrop
            sx={{
                zIndex: 1
            }}
            open={props.open}
            onClick={props.handleCart}
        >
        </Backdrop>
        <Box 
            sx={{ display: 'flex', 
            position: 'fixed',
            zIndex: 100
            }}
        >
            <CssBaseline />
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        [theme.breakpoints.down('sideDrawerFullWidth')]: {
                            width: '100%',
                        },
                    },

                }}
                variant="persistent"
                anchor="right"
                open={props.open}
            >
                <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
                </DrawerHeader>
                <Box sx={{
                    height: '60px', 
                    [theme.breakpoints.up('navBarSearch')]: {display: 'none'}}}
                ></Box>
                <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', height: '60px'}}>
                    <Typography sx={{fontSize: '25px', marginLeft: 'auto'}}>Your Cart</Typography>
                    <IconButton
                        sx={{
                            marginLeft: 'auto'
                        }}
                        onClick={props.handleCart}
                    >
                        <CloseIcon></CloseIcon>
                    </IconButton>
                </Box>
                <Divider />
                <Box sx={{display: 'flex', margin: '20px', justifyContent: 'center'}}>
                    <Typography>Subtotal {"("}{props.cartQty} {props.cartQty > 1 ? "products" : "product"}{")"} = ${(Number(props.subTotal).toFixed(2))}</Typography>
                </Box>
                <Button
                    variant='outlined'
                    sx={{
                        width: '350px',
                        alignSelf: 'center',
                        marginBottom: '10px',
                        color: theme.palette.secondary.main,
                        borderColor: theme.palette.secondary.main,
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                          borderColor: theme.palette.secondary.main
                        }
                    }}
                    onClick={() => {
                        props.handleCart()
                        router.push('/cart')
                    }}
                >
                    View Cart
                </Button>
                <Button
                    variant='contained'
                    disabled={props.cartItems.length === 0}
                    sx={{
                        width: '350px',
                        alignSelf: 'center',
                        marginBottom: '30px',
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.light,
                        }
                    }}
                    onClick={() => {
                        props.handleCart()
                        router.push('/checkout')
                    }}
                >
                    Proceed To Checkout
                </Button>
                <Divider />
                <Stack direction="column" spacing={1} sx={{overflow: 'auto', mt: '5px'}}>
                {props.cartItems.map((value, key) => {
                    return <CartDrawerItem
                        key={key}
                        userId={user.userId}
                        productId={value.productId}
                        productName={value.productName}
                        quantity={value.quantity}
                        availableQuantity={value.availableQuantity}
                        price={value.price}
                        picture={value.picture}
                        cartItems={props.cartItems}
                        handleCartChange={props.handleCartChange}
                        handleCart={props.handleCart}
                    />
                })}
                </Stack>
                <Box sx={{flexGrow: 1}}/>
            </Drawer>
        </Box>
    </>
    );
}