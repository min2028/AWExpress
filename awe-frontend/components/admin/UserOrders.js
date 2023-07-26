import {useSelector} from "react-redux";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import axios from "axios";
import Loader from "../utilities/loader";
import {useTheme} from "@mui/material/styles";
import {
  Box, Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';

/*
{
  "orders":[
    {
      "orderId":1071,
      "buyerId":2050,
      "status":3,
      "items":[
        {
          "productName":"JJ Test - SUGAS",
          "description":"Switzerland fruit chews - the best in the wor",
          "quantity":100,
          "price":12.12,
          "picture":"https://s3.amazonaws.com/aws.image//tmp/Sugus.jpg"
        },
      ]
    },
  ]
}

2-Paid
3-Delivered
4-Cancelled

 */

export default function UserOrders(props) {
  const {userId, id_token} = props;
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(
      `/api/user/${userId}/orderhistory`,
      {headers: {'Content-Type': 'application/json', 'authorization': id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setOrders(response.data.orders.filter(order => order.status === 2));
        setLoading(false);
      }
    }).catch((err) => {
      console.log(`error getting user's orders with error ${JSON.stringify(err.response.data)}`)
      setLoading(false);
    })
  }, [])

  const dialogOpen = () => {
    setOpen(true);
  }

  const dialogClose = () => {
    setOpen(false);
    setDeleteLoading(false);
  }

  const deleteOrder = () => {
    setDeleteLoading(true);
    axios.post(
      `/api/admin/${user.userId}/cancelorder`,
      {orderId: selectedOrder},
      {headers: {'Content-Type': 'application/json', 'authorization': id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setOrders(
          orders.filter(order => order.orderId !== selectedOrder)
        )
        setDeleteLoading(false);
        setOpen(false)
      }
    }).catch((err) => {
      console.log(`error in removing post with error: ${JSON.stringify(err.response.data)}`)
      setDeleteLoading(false);
    })
  }

  if (orders.length > 0) {
    return (
      <>
        <Divider sx={{mt: '20px', mb: '15px'}}/>
        <Typography variant='h6' sx={{mb: '20px'}}>Active Orders</Typography>
        {
          orders.map((order, index) => (
                <Stack key={index} direction='column' sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: "100%",
                  minWidth: '300px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: '20px',
                  backgroundColor: 'white',
                  borderRadius: '3px',
                  paddingBottom: '20px',
                }}>
                  <Box sx={{
                    display: 'flex',
                    height: '50px',
                    width: '100%',
                    backgroundColor: theme.palette.secondary.main,
                    pl: '20px',
                    pr: '20px',
                    alignItems: 'flex-end',
                    mb: '10px',
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  }}>
                    <Typography variant="h6" sx={{color: theme.palette.background.default}}>
                      Order #: {order.orderId}
                    </Typography>
                    <Tooltip title="Cancel Order">
                      <IconButton
                        sx={{ml: 'auto', mt: 'auto', mb: 'auto', color: theme.palette.primary.main}}
                        onClick={ () => {
                          setSelectedOrder(order.orderId);
                          dialogOpen();
                        }}>
                        <CancelIcon/>
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Stack direction='column' spacing={-2} sx={{mb: '10px', overflow: 'auto'}}>
                    {
                      order.items.map((item, index) => (
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
                          <Stack spacing={2} direction='row'>
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
                          </Stack>
                        </Stack>
                      ))
                    }
                  </Stack>
                </Stack>
          ))
        }

        <Dialog
          open={open}
          onClose={dialogClose}
        >
          <DialogTitle>
            Are you sure you want to delete this order?
          </DialogTitle>
          <DialogContent>
            {"(You will cancel this order along with each seller's pending order)"}
          </DialogContent>
          <DialogActions>
            <Button
              disabled={deleteLoading}
              variant='contained'
              sx={{backgroundColor: 'red', color: 'white'}}
              onClick={deleteOrder}
            >
              {!deleteLoading &&
                'Yes'
              }
              {deleteLoading &&
                <IconButton disabled>
                  <Loader contained={true} size={25} color={theme.palette.secondary.contrastText}/>
                </IconButton>
              }
            </Button>
            <Button sx={{color: theme.palette.secondary.main}} onClick={dialogClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>

    )
  } else {
    return (
      <></>
    )
  }
}