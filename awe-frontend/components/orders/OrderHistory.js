import { useTheme } from '@mui/material/styles';
import {Box, Divider, Stack, Typography, Button} from "@mui/material";
import {useState} from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import MessageModal from '../MessageModal';

/*
Props:
orderId: <int>, items: <array>

item: {
    orderId: 123,
    productId: 22,
    productName: 'T-Shirt',
    productPrice: '59.49',
    productPicture: 'url',
    quantity: 3,
    shipAddress: {
      street: "123 Easy St",
      city: "Vancouver",
      postal: "A1B2C3",
      province: "British Columbia"
    }}
 */
export default function OrderHistory (props) {
    const { data: session, statuss } = useSession();
    const user = useSelector((state) => state.auth.user);
    const [isErrorOpen, setErrorOpen] = useState(false)

    const STATUS_DESCRIPTION = {
        2: "Processing",
        5: "Confirmed",
        6: "Shipped",
        3: "Delivered",
        4: "Cancelled"
    }

    const STATUS_CODE = { 
        "Processing": 2,
        "Confirmed": 5, 
        "Shipped": 6, 
        "Delivered": 3, 
        "Cancelled": 4,
    };

    const [status, setStatus] = useState(props.status)

    const theme = useTheme();

    const [items, setItems] = useState(props.items)

    const address = props.shipAddress;

    const PRODUCT_DETAILS_SIZE = '120px'
    const ADDRESS_DETAILS_SIZE = '90px'

    return (
        <Stack direction='column' sx={{
            display: 'flex',
            justifyContent: 'center',
            width: "100%",
            // minWidth: '300px',
            marginLeft: 'auto',
            marginRight: 'auto',
            backgroundColor: 'white',
            borderRadius: '3px',
            paddingBottom: '20px',
        }}>
            <MessageModal open={isErrorOpen} setOpen={setErrorOpen}
                subject='Error'
                message='Something went wrong when we tried to cancel your order. Your order has not been cancelled.'
            />
            <Box sx={{
                display: 'flex',
                height: '50px',
                width: '100%',
                backgroundColor: theme.palette.secondary.main,
                pl: '20px',
                pr: '20px',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                mb: '10px',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                [theme.breakpoints.down('orderHistoryNumberAndStatusText')]: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '75px'
                }
            }}>
                <Typography variant="h6" sx={{color: theme.palette.background.default}}>
                    Order #: {props.orderId}
                </Typography>
                <Typography variant="h6" sx={{color: theme.palette.background.default}}>
                    Status: {STATUS_DESCRIPTION[status]}
                </Typography>
            </Box>

            <Stack direction='column' spacing={1} sx={{mb: '10px', overflow: 'auto'}}>
                {
                    items.map((item, index) => (
                        <Stack key={index} direction={{sm: 'column', md: 'row'}} spacing={2} sx={{p: '2%'}}>
                            <Box sx={{height: 62.5, width: 100, minWidth: 100}}>
                                <Box
                                    component='img'
                                    src={item.picture}
                                    sx={{
                                        objectFit: 'contain',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </Box>
                            {/* <Stack spacing={2} direction='row'>
                                <Stack direction='column'>
                                    <Typography variant='subtitle1' noWrap>Product Name:</Typography>
                                    <Typography variant='subtitle1' noWrap>Product Price:</Typography>
                                    <Typography variant='subtitle1' noWrap>Quantity:</Typography>
                                </Stack>
                                <Stack direction='column'>
                                    <Typography variant='subtitle1' noWrap>{item.productName}</Typography>
                                    <Typography variant='subtitle1' noWrap>${item.price}</Typography>
                                    <Typography variant='subtitle1' noWrap>{item.quantity}</Typography>
                                </Stack>
                            </Stack> */}
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: '7px'}}>
                                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Product Name: </Typography></Box>
                                    <Typography>{item.productName}</Typography>
                                </Box>
                                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Product Price: </Typography></Box>
                                    <Typography>${Number(item.price).toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Quantity: </Typography></Box>
                                    <Typography>{item.quantity}</Typography>
                                </Box>
                            </Box>
                        </Stack>
                    ))
                }
            </Stack>

            <Box sx={{p: '15px'}}>
                <Divider textAlign='left' sx={{mb: '15px'}}> Shipping Information </Divider>
                {/* <Stack spacing={[2]} direction='row'>
                    <Stack direction='column'>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Street:</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>City:</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Postal Code:</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Province:</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Country:</Typography>
                    </Stack>
                    <Stack direction='column'>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.streetAddress.length !== 0 ? address.streetAddress : 'n/a'}</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.city.length !== 0 ? address.city : 'n/a'}</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.postalCode.length !== 0 ? address.postalCode : 'n/a'}</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.province.length !== 0 ? address.province : 'n/a'}</Typography>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>Canada</Typography>
                    </Stack>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%',
                        }}
                    >
                        <Button
                            variant='contained'
                            disabled={status !== 2}
                            sx={{
                                alignSelf: 'flex-end',
                                marginLeft: 'auto'
                            }}
                            onClick={() => {
                                axios.post(
                                    `/api/user/${user.userId}/cancelorder/`,
                                    {orderId: props.orderId},
                                    {headers: {
                                        'Content-Type': 'application/json',
                                        authorization: session.id_token,
                                    }}
                                ).then((response) => {
                                    console.log(response)
                                    setStatus(4)
                                }).catch((error) => {
                                    console.log("error: order could not be cancelled")
                                    console.log(error)
                                    setErrorOpen(true)
                                })
                            }}
                        >
                                Cancel Order
                        </Button>
                    </Box>
                </Stack> */}
                <Box sx={{display: 'flex', flexDirection: 'column', gap: '7px'}}>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{width: ADDRESS_DETAILS_SIZE, minWidth: ADDRESS_DETAILS_SIZE}}><Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Street:</Typography></Box>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.streetAddress.length !== 0 ? address.streetAddress : 'n/a'}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{width: ADDRESS_DETAILS_SIZE, minWidth: ADDRESS_DETAILS_SIZE}}><Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>City:</Typography></Box>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.city.length !== 0 ? address.city : 'n/a'}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{width: ADDRESS_DETAILS_SIZE, minWidth: ADDRESS_DETAILS_SIZE}}><Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Postal Code:</Typography></Box>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.postalCode.length !== 0 ? address.postalCode : 'n/a'}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{width: ADDRESS_DETAILS_SIZE, minWidth: ADDRESS_DETAILS_SIZE}}><Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Province:</Typography></Box>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>{address.province.length !== 0 ? address.province : 'n/a'}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <Box sx={{width: ADDRESS_DETAILS_SIZE, minWidth: ADDRESS_DETAILS_SIZE}}><Typography variant='subtitle2' sx={{color: theme.palette.secondary.light}}>Country:</Typography></Box>
                        <Typography variant='subtitle2' sx={{color: theme.palette.secondary.main}}>Canada</Typography>
                    </Box>
                    <Button
                        variant='contained'
                        disabled={status !== 2}
                        sx={{
                            alignSelf: 'flex-end',
                            marginLeft: 'auto'
                        }}
                        onClick={() => {
                            axios.post(
                                `/api/user/${user.userId}/cancelorder/`,
                                {orderId: props.orderId},
                                {headers: {
                                    'Content-Type': 'application/json',
                                    authorization: session.id_token,
                                }}
                            ).then((response) => {
                                console.log(response)
                                setStatus(4)
                            }).catch((error) => {
                                console.log("error: order could not be cancelled")
                                console.log(error)
                                setErrorOpen(true)
                            })
                        }}
                    >
                            Cancel Order
                    </Button>
                </Box>
            </Box>
        </Stack>
    )
}