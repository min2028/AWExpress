import {styled, useTheme} from "@mui/material/styles";
import {Box, Button, Divider, IconButton, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {useRouter} from "next/router";
import SpecialDealsCard from "./SpecialDealsCard"
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ProductCard from "./ProductCard";
import axios from "axios";
import {useSession} from "next-auth/react";

export default function SpecialDealsBar(props) {

  const theme = useTheme();
  const {data: session, status} = useSession();

  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get(
      '/api/products/department',
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setProducts(response.data.items.filter(item => item.status === 1));
      }
    }).catch((err) => {
      console.log(`Error in getting products ${JSON.stringify(err.response)}`);
    })
  }, [])

  if (products.length > 0) {
    return(
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        width: '100%',
        height: 'auto',
        borderRadius: '3px',
        pl: '20px',
        pr: '20px',
        pt: '10px',
      }}>
        <Typography variant='h5' sx={{fontWeight: 'bold', color: theme.palette.secondary.main,
          [theme.breakpoints.down('specialDepartmentDealsText')]: {
            fontSize: '20px'
          },}}
        >
          Special Department Deals
        </Typography>
        <Typography variant='body2' sx={{ml: '1px', fontWeight: 'light', fontSize: 14, mb: '15px',
          [theme.breakpoints.down('specialDepartmentDealsText')]: {
            fontSize: '11px'
          },}}>
          See all the special offers from various departments
        </Typography>
        <Stack direction='row' sx={{width: '100%', alignItems: 'center'}}>
          <KeyboardArrowLeftIcon sx={{color: 'grey'}}/>
          <Box sx={{flexGrow: 1, overflow: 'auto'}}>
            <Stack direction="row">
            {
              products.map((item, key) => (
                <SpecialDealsCard
                  key={key}
                  postId={item.postId}
                  productId={item.productId}
                  name={item.productName}
                  category={item.categoryId}
                  sellerId={item.sellerId}
                  description={item.description}
                  price={item.price}
                  quantity={item.quantity}
                  picture={item.picture}
                  sellerFirstName={item.sellerFirstName}
                  sellerLastName={item.sellerLastName}
                  sellerDepartment={item.sellerDepartment}
                  availableQuantity={item.availableQuantity}
                />
              ))
            }
            </Stack>
          </Box>
          <KeyboardArrowRightIcon sx={{color: 'grey'}}/>

        </Stack>

      </Box>
    )
  } else {
    return (
      <></>
    )
  }

}