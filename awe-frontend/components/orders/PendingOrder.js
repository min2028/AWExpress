import { useTheme } from '@mui/material/styles';
import {Box, Divider, Stack, Typography, Button} from "@mui/material";
import {useEffect, useState} from "react";



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
      streetAddress: "123 Easy St",
      city: "Vancouver",
      postalCode: "A1B2C3",
      province: "British Columbia"
    }}
 */
export default function PendingOrder (props) {

  const theme = useTheme();

  const [items, setItems] = useState(props.items)

  const address = JSON.parse(items[0].shipAddress);

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
        Order #: {props.orderId}
      </Typography>
    </Box>

    <Stack direction='column' spacing={1} sx={{mb: '10px', overflow: 'auto'}}>
      {
        items.map((item, index) => (
          <Stack key={index} direction={{sm: 'column', md: 'row'}} spacing={2} sx={{p: '2%'}}>
            <Box sx={{height: 180, width: 200, minWidth: 200}}>
              <Box
                component='img'
                src={item.productPicture}
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
                <Typography variant='subtitle1' noWrap>Product ID:</Typography>
                <Typography variant='subtitle1' noWrap>Product Price:</Typography>
                <Typography variant='subtitle1' noWrap>Quantity:</Typography>
              </Stack>
              <Stack direction='column'>
                <Typography variant='subtitle1' noWrap>{item.productName}</Typography>
                <Typography variant='subtitle1' noWrap>{item.productId}</Typography>
                <Typography variant='subtitle1' noWrap>${item.productPrice}</Typography>
                <Typography variant='subtitle1' noWrap>{item.quantity}</Typography>
              </Stack>
            </Stack> */}
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '7px'}}>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Product Name: </Typography></Box>
                    <Typography>{item.productName}</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Product ID: </Typography></Box>
                    <Typography>{item.productId}</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Box sx={{width: PRODUCT_DETAILS_SIZE, minWidth: PRODUCT_DETAILS_SIZE}}><Typography>Product Price: </Typography></Box>
                    <Typography>${Number(item.productPrice).toFixed(2)}</Typography>
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
      {/* <Stack spacing={2} direction='row'>
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
          disabled={true}
          sx={{
              alignSelf: 'flex-end',
              marginLeft: 'auto'
          }}
        >Mark order as shipped</Button>
      </Box>
    </Box>
  </Stack>
  )
}