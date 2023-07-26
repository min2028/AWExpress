import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {Button, Box, Typography, Backdrop} from "@mui/material";
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux';
import NavbarLayout from '../layouts/Navbar'
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import SpecialDealsBar from '../components/SpecialDealsBar';
import { useSession } from 'next-auth/react';
import axios from "axios";
import Loader from "../components/utilities/loader";
import ProductModal from '../components/ProductModal';

export default function Home() {
  const theme = useTheme();
  const {data: session, status} = useSession();
  const user = useSelector(state => state.auth.user);

  const [products, setProducts] = useState([]);
  const [numOfPages, setNumOfPages] = useState(1)
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter()
  let productSearchParameters = router.query

  useEffect(() => {
    setLoading(true)
    axios.post(
      '/api/products',
      {page: page, status: 1, ...productSearchParameters},
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setLoading(false);
        setProducts(response.data.items);
        setNumOfPages(response.data.numOfPages)
      }
    }).catch((err) => {
      setLoading(false);
      console.log(`Error in getting products ${JSON.stringify(err.response)}`);
    })
  }, [page, productSearchParameters])


    return (
      <>
        <Head>
          <title>AWExpress - Home</title>
          <meta name="home"/>
          <link rel="icon" href="/favicon.ico?v=2"/>
        </Head>

        {loading &&
          <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
            <Loader size={10} color={theme.palette.secondary.main}/>
          </Backdrop>
        }

        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            justifyContent: 'center',
            pl: '5%',
            pr: '5%'
        }}>
          <SpecialDealsBar products={products}/>
          {
            products.map((item, key) => (
              <ProductCard
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
        </Box>

        {products.length > 0 &&
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '50px'
          }}>
            <Pagination
              numOfPages={numOfPages}
              searchParameters={productSearchParameters}
            />
          </Box>
        }
      </>
    )
}

Home.getLayout = (page) => {
  return (
    <NavbarLayout>
      {page}
    </NavbarLayout>
  )
}