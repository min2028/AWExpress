import NavbarLayout from '../layouts/Navbar';
import {useEffect, useState} from 'react';
import {Box, Typography, Backdrop, Select, MenuItem, TextField, InputLabel, FormControl, Stack, useMediaQuery} from '@mui/material';
import ProductCard from '../components/ProductCard';
import {useSession} from 'next-auth/react';
import {useTheme} from '@mui/material/styles';
import {useSelector} from 'react-redux';
import Loader from '../components/utilities/loader';
import axios from 'axios';
import BackButton from '../components/utilities/BackButton';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material';
import Head from "next/head";

const STATUS_OPTION = {
  'All': null,
  'Active': 1,
  'Inactive': 2,
}

const CATEGORY_OPTION = {
  "All": null,
  "Electronics": 0,
  "Clothing": 1,
  "Home and Kitchen": 2,
  "Toys": 3,
  "Books": 4,
  "Supplements": 5,
  "Drugs": 6,
  "Drinks and Food": 7,
  "Pets Good": 8,
  "Others": 9,
}

export default function Listings() {
  const theme = useTheme();
  const {data: session, status} = useSession();
  const user = useSelector((state) => state.auth.user);
  const [initialListingData, setinitialListingData] = useState([]);
  const [listingStatus, setListingStatus] = useState('All')
  const [listingProductName, setListingProductName] = useState("")
  const [listingCategory, setListingCategory] = useState("All")
  const [loading, setLoading] = useState(false);

  const isFilterTooBig = useMediaQuery(theme.breakpoints.down('listingsFilterDisplay'))

  useEffect(() => {
    setLoading(true);
    axios.post(
      '/api/products',
      {
        page: 1,
        productName: listingProductName,
        sellerId: user.userId,
        status: STATUS_OPTION[listingStatus],
        categoryId: CATEGORY_OPTION[listingCategory],
      },
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      setLoading(false);
      // for (let item of response.data.products) {
      //     Array.push({
      //         product_id: item.productId ?? '',
      //         seller_id: item.sellerId ?? '',
      //         product_name: item.productName ?? '',
      //         price: item.price ?? '',
      //         description: item.description ?? '',
      //         picture: item.picture ?? '',
      //         quantity: item.quantity ?? '',
      //         product_status: item.status ?? '',
      //         category_id: item.categoryId ?? '',
      //     });
      // }
      setinitialListingData(response.data['items']);
    })
      .catch((err) => {
        setLoading(false);
        console.log(
          `Something went wrong when getting product list. Error: ${err.response.data}`
        );
      });
  }, [listingStatus, listingProductName, listingCategory]);

  return (
    <>
      <Head>
        <title>AWExpress - Your Listings</title>
        <meta name="your listings"/>
        <link rel="icon" href="/favicon.ico?v=2"/>
      </Head>
      <Stack
        direction="column"
        sx={{
          ml: '15%',
          mr: '15%',
        }}
      >
        <BackButton/>
        <Typography sx={{fontSize: '48px'}}>Your Listings</Typography>
        <Typography sx={{fontSize: '18px', mt: '-10px', ml: '5px', mb: '25px'}}>Manage all your listed items</Typography>
        <Stack direction={isFilterTooBig ? 'column' : 'row'} spacing={3} sx={{mb: '50px'}}>
          <TextField
            placeholder='Search Listings...'
            sx={{
              width: '300px'
            }}
            onKeyDown={(event) => {
              if (event.key == 'Enter') {
                setListingProductName(event.target.value)
                event.preventDefault()
              }
            }}
          >
          </TextField>
          <FormControl>
            <InputLabel id='statusLabel'>Status</InputLabel>
            <Select
              labelId='statusLabel'
              id='status-label'
              value={listingStatus}
              label='Status'
              sx={{
                width: '120px'
              }}
              onChange={(event) => {
                setListingStatus(event.target.value)
              }}
            >
              {Object.keys(STATUS_OPTION).map((value, index) => {
                return <MenuItem key={index} value={value}>{value}</MenuItem>
              })}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id='categoryLabel'>Category</InputLabel>
            <Select
              labelId='categoryLabel'
              id='category-label'
              value={listingCategory}
              label='Category'
              sx={{
                width: '190px'
              }}
              onChange={(event) => {
                setListingCategory(event.target.value)
              }}
            >
              {Object.keys(CATEGORY_OPTION).map((value, index) => {
                return <MenuItem key={index} value={value}>{value}</MenuItem>
              })}
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            gap: '24px',
            justifyContent: 'center',
            pl: '5%',
            pr: '5%'
          }}
        >
          {loading && (
              <Loader
                contained
                size={75}
                color={theme.palette.secondary.main}
              />
          )}

          {initialListingData.length > 0 && !loading &&
            initialListingData.map((item, id) => (
              <ProductCard
                key={id}
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
                isListing={true}
                status={item.status}
              />
            ))
          }
          {initialListingData.length == 0 && !loading && (
            <Typography sx={{fontSize: '2rem'}}>No listings to show... </Typography>
          )}
        </Box>
      </Stack>
    </>
  );
}

Listings.getLayout = (page) => {
  return <NavbarLayout>{page}</NavbarLayout>;
};
