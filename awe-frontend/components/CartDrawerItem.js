import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { MenuItem, Select, Typography, Box, Button, keyframes, IconButton } from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import { Router } from 'next/router';
import { useDispatch } from 'react-redux';
import {updateAllAmounts} from '../actions/amounts';
import { useTheme } from '@emotion/react';

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

const shadowPopBr = keyframes`
    0% {
        -webkit-box-shadow: 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9;
                box-shadow: 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9;
        -webkit-transform: translateX(0) translateY(0);
                transform: translateX(0) translateY(0);
        -webkit-transform: scale(1);
                transform: scale(1);
    }
    100% {
        -webkit-box-shadow: 1px 1px 7px #d7d9d9, 2px 2px 7px #d7d9d9, 3px 3px 7px #d7d9d9, 4px 4px 7px #d7d9d9, 5px 5px 7px #d7d9d9, 6px 6px 7px #d7d9d9, 7px 7px 7px #d7d9d9, 8px 8px 7px #d7d9d9;
                box-shadow: 1px 1px 7px #d7d9d9, 2px 2px 7px #d7d9d9, 3px 3px 7px #d7d9d9, 4px 4px 7px #d7d9d9, 5px 5px 7px #d7d9d9, 6px 6px 7px #d7d9d9, 7px 7px 7px #d7d9d9, 8px 8px 7px #d7d9d9;
        -webkit-transform: translateX(-8px) translateY(-8px);
                transform: translateX(-8px) translateY(-8px);
        -webkit-transform: scale(1.05);
                transform: scale(1.05);
    }
`

export default function CartDrawerItem(props) {
    const theme = useTheme();
    const { data: session, status } = useSession();
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch()
    const router = useRouter();
    const [quantitySelected, setQuantitySelected] = useState(props.quantity);

    return (
        <Box sx={{ display: 'flex', gap: '16px' }}>
            <Card
                sx={{
                    width: '400px',
                    height: '120px',
                    backgroundColor: 'white',
                    display: 'flex',
                    boxShadow: "0px 0px",
                    // "&:hover": {
                    //     backgroundColor: '#c6c6c6',
                    //     animation: `${shadowPopBr} 0.15s ease-in both` 
                    // },
                    [theme.breakpoints.down('sideDrawerFullWidth')]: {
                        width: '100%',
                        
                    },
                }}
            >
                <CardMedia
                    sx={{ 
                        height: 120, 
                        width: 120,
                        minWidth: 120,
                        objectFit: 'contain',
                        '&:hover': {
                            cursor: 'pointer'
                        },
                      ml: '5px',
                    }}
                    component='img'
                    height='120'
                    src={props.picture}
                    
                    onClick={() => {
                        props.handleCart()
                        router.push({
                            pathname: '/product',
                            query: {productId: props.productId}
                        })
                    }}
                />
                <CardContent
                    sx={{
                        [theme.breakpoints.down('sideDrawerFullWidth')]: {
                            width: '100%',
                        },
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box 
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '170px',
                                }}
                            >
                                <Typography 
                                    sx={{ 
                                        fontSize: '14px',
                                        '&:hover': {
                                            cursor: 'pointer'
                                        } 
                                    }}
                                    onClick={() => {
                                        props.handleCart()
                                        router.push({
                                            pathname: '/product',
                                            query: {productId: props.productId}
                                        })
                                    }}
                                >
                                    {props.productName.slice(0, 30)}
                                </Typography>
                                <Typography 
                                    sx={{
                                        marginTop: '10px',
                                        [theme.breakpoints.up('cartDrawerItemDisplay')]: {
                                            display: 'none'
                                        },
                                    }}
                                >${(props.price*props.quantity).toFixed(2)}</Typography>
                                <Select 
                                    value={props.quantity}
                                    sx={{
                                        width: '60px', 
                                        height: '30px',
                                        marginTop: '10px',
                                    }}
                                    onChange={(event) => {
                                        axios.patch(
                                            `/api/user/${props.userId}/cart/${props.productId}/`,
                                            {
                                                quantity: event.target.value,
                                            },
                                            {
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    authorization: session.id_token,
                                                },
                                            }
                                        ).then((response) => {
                                            // dispatch({type: TRIGGER_CART_UPDATE});  
                                            props.handleCartChange(props.cartItems.map((item) => {
                                                return item.productId === props.productId ? {...item, quantity: event.target.value} : item
                                            }))
                                            console.log("cart quantity has been successfully updated")
                                            console.log(response)
                                        }).catch((error) => {
                                            console.log("cart quantity failed to update")
                                            console.log(error.response)
                                        })
                                    }}
                                >
                                    {[...Array(props.availableQuantity).keys()].map(
                                        (value, key) => {
                                            return (
                                                <MenuItem key={key} value={value + 1}>
                                                    {value + 1}
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'right',
                                    width: '70px',
                                    
                                }}
                            >
                                <IconButton
                                    sx={{
                                        marginLeft: 'auto',
                                        [theme.breakpoints.down('cartDrawerItemDisplay')]: {
                                            marginLeft: 0,
                                        },
                                    }}
                                    onClick={() => {
                                        axios.delete(
                                            `/api/user/${props.userId}/cart/${props.productId}`,
                                            {
                                                data: {
                                                    userId: props.userId,
                                                    productId: props.productId,
                                                },
                                                headers: {
                                                    'Content-Type':
                                                        'application/json',
                                                    authorization:
                                                        session.id_token,
                                                },
                                            }
                                        ).then((response) => {
                                            console.log("item has been sucessfully deleted")
                                            console.log(response)
                                            props.handleCartChange(props.cartItems.filter((item) => {
                                                return item.productId !== props.productId  
                                            }))
                                            // dispatch(updateAllAmounts(user.userId, session.id_token));
                                        }).catch((error) => {
                                            console.log("item has failed to be deleted")
                                            console.log(error.response)
                                        })
                                    }}
                                >
                                    <CloseIcon></CloseIcon>
                                </IconButton>
                                <Typography 
                                    sx={{
                                        textAlign: 'right',
                                        [theme.breakpoints.down('cartDrawerItemDisplay')]: {
                                            display: 'none'
                                        },
                                    }}
                                >${(props.price*props.quantity).toFixed(2)}</Typography>
                                
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            
        </Box>
    );
}
