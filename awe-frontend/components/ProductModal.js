import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Select, MenuItem, IconButton } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import {updateAllAmounts} from '../actions/amounts';
import { useRouter } from 'next/router';
import { useTheme } from '@emotion/react';
import MessageModal from './MessageModal';
import { TRIGGER_CART_UPDATE } from '../actions/types';

export default function ProductModal(props) {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [quantitySelected, setQuantitySelected] = useState(1);
  const [isErrorOpen, setErrorOpen] = useState(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    maxHeight: '100%',
    height: 'auto',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    [theme.breakpoints.down('productModalMedium')]: {
      width: 750,
    },
    [theme.breakpoints.down('productModalSmall')]: {
        overflow: 'scroll',
        width: 400,
        flexDirection: 'column',
    },
    [theme.breakpoints.down('productModalTiny')]: {
        width: 275,
    }
  };

  return (
    <Modal
        open={props.open}
        onClose={() => {props.setOpen(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <MessageModal open={isErrorOpen} setOpen={setErrorOpen}
                subject='Oops!'
                message='The quantity that you tried to add exceeds the available quantity of this item. You may already have this item in your cart.'
            ></MessageModal>
            <IconButton
                sx={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                }}
                onClick={() => {props.setOpen(false)}}
            >
                <CloseIcon/>
            </IconButton>
            <Box
                component='img'
                src={props.picture}
                sx={{
                    objectFit: 'contain',
                    width: '300px',
                    height: '300px',
                    marginRight: '10px',
                    [theme.breakpoints.down('productModalTiny')]: {
                        width: '200px',
                    }
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                }}
            >
                <Typography sx={{fontSize: '28px'}}>
                    {props.name}
                </Typography>
                <Typography sx={{ fontSize: '14px' }}>
                    Sold by: {props.sellerFirstName}{' '}
                    {props.sellerLastName} {' '}
                    {props.sellerDepartment === ''
                        ? null
                        : 'from ' + props.sellerDepartment}
                </Typography>
                <Divider/>
                <Typography sx={{ fontSize: '16px', marginTop: '16px' }}>
                    {props.description}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        marginTop: 'auto',
                        justifyContent: 'space-between',
                        [theme.breakpoints.down('productModalSmall')]: {
                            flexDirection: 'column',
                            gap: '10px'
                        }
                    }}
                >
                    <Typography sx={{fontSize: '28px', marginRight: 'auto'}}>${props.price}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                        }}
                    >
                        <Typography sx={{fontSize: '16px'}}>Qty:</Typography>
                        <Select
                            defaultValue={1}
                            sx={{
                                height: '40px',
                                width: '60px',
                                marginLeft: '5px'
                            }}
                            onChange={(event) => 
                                setQuantitySelected(event.target.value)
                            }
                        >
                            {[
                                ...Array(
                                    props.availableQuantity > 20 ? 20 : props.availableQuantity
                                ).keys(),
                            ].map((value, key) => {
                                return (
                                    <MenuItem key={key} value={value + 1}>
                                        {value + 1}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Box>
                    <Button 
                        variant='contained'
                        sx={{
                            fontSize: '12px',
                            marginLeft: '10px',
                            height: '40px',
                            backgroundColor: theme.palette.primary.alternate,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.alternateHover,
                            }
                        }}
                        onClick={() => {
                            axios
                                .post(
                                    `/api/user/${user.userId}/cart`,
                                    {
                                        productId:
                                            props.productId,
                                        quantity: quantitySelected,
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
                                    dispatch(updateAllAmounts(user.userId, session.id_token));
                                    console.log(
                                        'item quantity has successfully been added to cart'
                                    );
                                    props.setOpen(false)
                                })
                                .catch((error) => {
                                    if (error.response.status === 409) {
                                        console.log(
                                            'quantity: ' +
                                                error.response.data[
                                                    'quantity'
                                                ]
                                        );
                                        axios
                                            .patch(
                                                `/api/user/${user.userId}/cart/${props.productId}`,
                                                {
                                                    quantity:
                                                        quantitySelected +
                                                        error.response
                                                            .data[
                                                            'quantity'
                                                        ],
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
                                                // dispatch(updateAllAmounts(user.userId, session.id_token));
                                                dispatch({type: TRIGGER_CART_UPDATE})
                                                console.log(
                                                    'item quantity has successfully been updated'
                                                );
                                                console.log(response);
                                                props.setOpen(false)
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    'the server could not process add-to-cart due to internal error'
                                                );
                                                console.log(
                                                    error.response
                                                );
                                                setErrorOpen(true)
                                            });
                                    } else {
                                        console.log(
                                            'the server could not process add-to-cart due to internal error'
                                        );
                                        console.log(error.response);
                                        setErrorOpen(true)
                                    }
                                });
                        }}
                    >
                        Add To Cart
                    </Button>
                    <Button 
                        variant='contained'
                        sx={{
                            fontSize: '12px',
                            marginLeft: '10px',
                            height: '40px'
                        }}
                        onClick={() => {
                            axios
                                .post(
                                    `/api/user/${user.userId}/cart`,
                                    {
                                        productId:
                                            props.productId,
                                        quantity: quantitySelected,
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
                                    console.log(
                                        'item quantity has successfully been added to cart'
                                    );
                                    props.setOpen(false)
                                    router.push({
                                        pathname: '/cart',
                                      });
                                })
                                .catch((error) => {
                                    if (error.response.status === 409) {
                                        console.log(
                                            'quantity: ' +
                                                error.response.data[
                                                    'quantity'
                                                ]
                                        );
                                        axios
                                            .patch(
                                                `/api/user/${user.userId}/cart/${props.productId}`,
                                                {
                                                    quantity:
                                                        quantitySelected +
                                                        error.response
                                                            .data[
                                                            'quantity'
                                                        ],
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
                                                console.log(
                                                    'item quantity has successfully been updated'
                                                );
                                                console.log(response);
                                                props.setOpen(false)
                                                router.push({
                                                    pathname: '/cart',
                                                  });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    'the server could not process add-to-cart due to internal error'
                                                );
                                                console.log(
                                                    error.response
                                                );
                                                setErrorOpen(true)
                                            });
                                    } else {
                                        console.log(
                                            'the server could not process add-to-cart due to internal error'
                                        );
                                        console.log(error.response);
                                        setErrorOpen(true)
                                    }
                                });
                        }}
                    >
                        Buy It Now
                    </Button>
                </Box>
            </Box>
            
        </Box>
      </Modal>
  );
}