import {styled, useTheme} from "@mui/material/styles";
import {Box, Button, Divider, IconButton, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {useRouter} from "next/router";
import SpecialDealsCard from "./SpecialDealsCard"
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ProductsBarCard from "./ProductsBarCard";
import axios from "axios";
import {useSession} from "next-auth/react";

export default function ProductsBar(props) {
  const { products, title, subtitle } = props

  const theme = useTheme();

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
        <Typography variant='h5' sx={{fontWeight: 'bold', color: theme.palette.secondary.main}}>
          {title}
        </Typography>
        <Typography variant='body2' sx={{ml: '1px', fontWeight: 'light', fontSize: 14, mb: '15px'}}>
          {subtitle}
        </Typography>
        <Stack direction='row' sx={{width: '100%', alignItems: 'center'}}>
          <KeyboardArrowLeftIcon sx={{color: 'grey'}}/>
          <Box sx={{flexGrow: 1, overflow: 'auto'}}>
            <Stack direction="row">
              {
                products.slice(0,20).map((item, key) => (
                  <ProductsBarCard
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