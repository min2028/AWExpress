import * as React from 'react';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Backdrop, Box, Grow, IconButton, keyframes, Tooltip, useMediaQuery} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ProductModal from './ProductModal';
import { useRouter } from 'next/router';

/*
Props:
productId: <char>
name: <char>
seller: <char>
picture: <url>
description: <char>
price: <double>
quantity: <char>

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

const shadowUnPopBr = keyframes`
    0% {
        -webkit-box-shadow: 1px 1px 7px #d7d9d9, 2px 2px 7px #d7d9d9, 3px 3px 7px #d7d9d9, 4px 4px 7px #d7d9d9, 5px 5px 7px #d7d9d9, 6px 6px 7px #d7d9d9, 7px 7px 7px #d7d9d9, 8px 8px 7px #d7d9d9;
                box-shadow: 1px 1px 7px #d7d9d9, 2px 2px 7px #d7d9d9, 3px 3px 7px #d7d9d9, 4px 4px 7px #d7d9d9, 5px 5px 7px #d7d9d9, 6px 6px 7px #d7d9d9, 7px 7px 7px #d7d9d9, 8px 8px 7px #d7d9d9;
        -webkit-transform: translateX(-8px) translateY(-8px);
                transform: translateX(-8px) translateY(-8px);
        -webkit-transform: scale(1.05);
                transform: scale(1.05);
    }
    100% {
        -webkit-box-shadow: 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9;
                box-shadow: 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9, 0 0 #d7d9d9;
        -webkit-transform: translateX(0) translateY(0);
                transform: translateX(0) translateY(0);
        -webkit-transform: scale(1);
                transform: scale(1);
    }
`

export default function ProductCard(props) {
    const theme = useTheme()
    const [isMouseHover, setMouseHover] = useState(false)
    const [isModalOpen, setModalOpen] = useState(false)
    const router = useRouter()
    const isLikelyTouchScreen = useMediaQuery(theme.breakpoints.down('likelyTouchScreen'))

    const handleMouseHover = (value) => {
        setMouseHover(value)
    }

    return (
        <>
        <ProductModal open={isModalOpen} setOpen={setModalOpen} {...props}></ProductModal>
        <Grow in={true}>
                <Card
                    sx={{
                        href: '/product',
                        width: '250px',
                        height: '400px',
                        backgroundColor: 'white',
                        borderRadius: '3px',
                        animation: `${shadowUnPopBr} 0.15s ease-out both`,
                        "&:hover": {
                            backgroundColor: '#f0f0f0',
                            animation: `${shadowPopBr} 0.15s ease-in both`,
                            cursor: 'pointer'
                        },

                    }}
                    onMouseEnter={() => {setMouseHover(true)}}
                    onMouseLeave={() => {setMouseHover(false)}}
                >
                    {props.isListing && (
                        <>
                            {/*{props.status === 1 && (*/}
                            {/*    <Typography*/}
                            {/*        style={{*/}
                            {/*            fontSize: '18px',*/}
                            {/*            fontWeight: 'bold',*/}
                            {/*            'margin-left': '18px',*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        active*/}
                            {/*    </Typography>*/}
                            {/*)}*/}
                            {(props.status === 2 || props.status === 4) &&
                                // <Typography
                                //     style={{
                                //         fontSize: '18px',
                                //         fontWeight: 'bold',
                                //         'margin-left': '18px',
                                //     }}
                                // >
                                //     inactive
                                // </Typography>
                              <Backdrop open={true} sx={{backgroundColor: props.status === 4 ? "rgb(240, 200, 200, 0.5)" : "rgb(200, 200, 200, 0.5)", zIndex: 99}} onClick={() => {
                                router.push({
                                    pathname: '/product',
                                    query: {productId: props.productId}
                                })
                              }}/>
                            }
                        </>
                    )}
                    <Box 
                        sx={{
                            display: props.status === 4 ? 'flex' : 'none',
                            flexDirection: 'column',
                            position: 'absolute',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '50%',
                        }}
                    >
                        <Typography sx={{color: 'red', fontSize: '24px', textAlign: 'center'}}>This item has been disabled by an admin</Typography>
                        <Typography sx={{color: 'red', fontSize: '12px', textAlign: 'center'}}>If you believe this was a mistake, please contact your administrator</Typography>
                    </Box>
                    <CardMedia
                        sx={{ height: 200 }}
                        component='img'
                        height='200'
                        image={props.picture}
                        title={props.name}
                        onClick={() => {
                            router.push({
                                pathname: '/product',
                                query: {productId: props.productId}
                            })
                        }}
                    />
                    {isMouseHover === false && isLikelyTouchScreen === false || props.isListing === true ? null :
                        <Grow in={true}>
                            <CardActions sx={{position: 'absolute', bottom: '10px', right: '10px'}}>
                              <Tooltip title="Quick Add">
                                <IconButton
                                    variant='contained'
                                    size='small'
                                    sx={{
                                      zIndex: 1,
                                      bgcolor: theme.palette.primary.main,
                                      color: 'white',
                                      "&:hover": {
                                        backgroundColor: theme.palette.primary.light,
                                      },
                                    }}
                                    onClick={() => {setModalOpen(true)}}
                                >
                                    <AddShoppingCartIcon />
                                </IconButton>
                              </Tooltip>
                            </CardActions>
                        </Grow>
                    }
                    <CardContent
                        style={{ height: "50%" }}
                        onClick={() => {
                            router.push({
                                pathname: '/product',
                                query: {productId: props.productId}
                            })
                        }}
                    >
                        <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                            <Box>
                                <Typography
                                    noWrap
                                    style={{
                                      fontSize: '18px',
                                      fontWeight: 'bold',
                                    }}
                                >
                                    {props.name.slice(0, 30)}
                                </Typography>
                                <Typography
                                    style={{ fontSize: '9px' }}
                                >
                                    Sold by: {props.sellerFirstName} {props.sellerLastName} from {props.sellerDepartment}
                                </Typography>
                            </Box>
                            <Typography
                                color='text.secondary'
                                style={{
                                  display: '-webkit-box',
                                  fontSize: '14px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  WebkitLineClamp: '2',
                                  WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {props.description.slice(0, 75)}
                            </Typography>
                            <Box>
                                <Typography
                                    style={{ fontSize: '18px', fontWeight: 'bold', color: theme.palette.secondary.main }}
                                >
                                    ${Number(props.price).toFixed(2)}
                                </Typography>
                                <Typography style={{ fontSize: '14px' }}>
                                    {props.availableQuantity} Available
                                </Typography>
                                <Typography style={{ fontSize: '10px' }}>
                                    {props.category}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
        </Grow>
        </>
    );
}
