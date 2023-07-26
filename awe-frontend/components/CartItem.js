import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {
    MenuItem,
    Select,
    Typography,
    Box,
    Button,
    keyframes,
    Stack,
    IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateAllAmounts } from '../actions/amounts';
import CloseIcon from '@mui/icons-material/Close';
import { TRIGGER_CART_UPDATE } from '../actions/types';

/*
Props:
productId: <int>
productName: <char>
description: <char>
price: <double>
quantity: <int>
picture: <char>
userId: <int>
sessionIdToken: <int>
availableQuantity: <int>

 */

export default function CartItem(props) {
    const theme = useTheme();
    const { data: session, status } = useSession();
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const handleCartItemDelete = () => {
        axios
            .delete(`/api/user/${props.userId}/cart/${props.productId}`, {
                data: {
                    userId: props.userId,
                    productId: props.productId,
                },
                headers: {
                    'Content-Type': 'application/json',
                    authorization: session.id_token,
                },
            })
            .then((response) => {
                // props.setUpdateCart(props.updateCart + 1)
                dispatch(updateAllAmounts(user.userId, session.id_token));
            })
            .catch((error) => {
                console.log(
                    'the item could not be deleted due to internal error'
                );
                console.log(error);
            });
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            gap: '16px' ,
            [theme.breakpoints.down('cartItemDisplay')]: {
                flexDirection: 'column'
            }
        }}>
            <Link href= {{
                pathname: '/product',
                query: {productId: props.productId}
            }}
            as={`/product/${props.productId}`}
            >
                <Card
                    sx={{
                        width: '550px',
                        height: '200px',
                        borderRadius: '3px',
                        display: 'flex',
                        boxShadow: '0px 0px',
                        [theme.breakpoints.down('cartItemDisplay')]: {
                            width: '100%',
                        },
                        [theme.breakpoints.down('cartItemDisplayVertical')]: {
                            flexDirection: 'column',
                            height: 'auto',
                        },
                    }}
                >
                    <IconButton
                        variant='contained'
                        sx={{
                            alignSelf: 'flex-end',
                            [theme.breakpoints.up('cartItemDisplayVertical')]: {
                                display: 'none'
                            },
                        }}
                        onClick={handleCartItemDelete}
                    >
                        <CloseIcon />
                    </IconButton>
                    <CardMedia
                        sx={{ 
                            height: 200, 
                            width: 200, 
                            objectFit: 'contain', 
                            ml: '10px',
                            [theme.breakpoints.down('cartItemDisplayVertical')]: {
                                alignSelf: 'center'
                            }
                        }}
                        component='img'
                        height='200'
                        src={props.picture}
                    />
                    <CardContent>
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                            }}
                        >
                            <Typography
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: theme.palette.secondary.main,
                                }}
                            >
                                {props.productName.slice(0, 30)}{props.productName.length > 30 ? "..." : ""}
                            </Typography>
                            <Typography
                                color='text.secondary'
                                style={{ fontSize: '14px' }}
                            >
                                {props.description.slice(0, 100)}{props.description.length > 100 ? "..." : ""}
                            </Typography>
                            {props.availableQuantity === 0 && (
                                <Typography
                                    sx={{ fontSize: '16px', color: 'red' }}
                                >
                                    This product is no longer available, please
                                    remove from cart
                                </Typography>
                            )}
                            <Typography
                                variant='h6'
                                style={{ fontWeight: 'bold' }}
                            >
                                ${Number(props.price).toFixed(2)}
                            </Typography>
                        </Box>
                    </CardContent>
                    <IconButton
                        variant='contained'
                        sx={{
                            alignSelf: 'flex-start',
                            [theme.breakpoints.up('cartItemDisplay')]: {
                                display: 'none',
                            },
                            [theme.breakpoints.down('cartItemDisplayVertical')]: {
                                display: 'none'
                            },
                        }}
                        onClick={handleCartItemDelete}
                    >
                        <CloseIcon />
                    </IconButton>
                </Card>
            </Link>
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '60px', 
                    minWidth: '200px',  
                    // backgroundColor: 'black',
                    [theme.breakpoints.down('cartItemDisplay')]: {
                        flexDirection: 'row-reverse',
                        // alignItems: 'right',
                        // justifyItems: 'flex-end',
                    },
                    [theme.breakpoints.down('cartItemDisplayVertical')]: {
                        flexDirection: 'row',
                    },
                }}
            >
                <Stack
                    direction='row'
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <Stack direction='row' spacing={1}>
                        {props.availableQuantity > 0 && (
                            <>
                                <Typography>Qty:</Typography>
                                <Select
                                    sx={{ maxHeight: '32px' }}
                                    value={props.quantity}
                                    onChange={(e) => {
                                        axios
                                            .patch(
                                                `/api/user/${props.userId}/cart/${props.productId}/`,
                                                {
                                                    quantity: e.target.value,
                                                },
                                                {
                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',
                                                        authorization:
                                                            session.id_token,
                                                    },
                                                }
                                            )
                                            .then((response) => {
                                                if (response.status === 200) {
                                                    dispatch({
                                                        type: TRIGGER_CART_UPDATE,
                                                    });
                                                }
                                            })
                                            .catch((err) => {
                                                console.log(
                                                    `Something went wrong when getting product list. Error: ${err.response.data}`
                                                );
                                            });
                                    }}
                                >
                                    {[
                                        ...Array(
                                            props.availableQuantity > 20
                                                ? 20
                                                : props.availableQuantity
                                        ).keys(),
                                    ].map((value, key) => {
                                        return (
                                            <MenuItem
                                                key={value}
                                                value={value + 1}
                                            >
                                                {value + 1}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </>
                        )}
                    </Stack>
                    <Typography>
                        {Number(props.price * props.quantity).toFixed(2)}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                        variant='contained'
                        sx={{
                            [theme.breakpoints.down('cartItemDisplay')]: {
                                display: 'none',
                            },
                        }}
                        onClick={handleCartItemDelete}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
}
