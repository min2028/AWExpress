import NavbarLayout from '../layouts/Navbar';
import ProductCard from '../components/ProductCard';
import ProductsBar from '../components/ProductsBar';
import * as React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Button,
  Divider,
  MenuItem,
  Select,
  Typography,
  Backdrop, Stack, IconButton, TextField,
} from '@mui/material';
import RemovePostButton from '../components/admin/RemovePostButton';
import Loader from '../components/utilities/loader';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {updateAllAmounts} from '../actions/amounts';
import MessageModal from '../components/MessageModal';
import BackButton from "../components/utilities/BackButton";
import Head from "next/head";
import { TRIGGER_CART_UPDATE } from '../actions/types';
import { useMediaQuery } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/*
query:
{productId, postId, name, seller, description, price, quantity, picture, category}
 */

const CATEGORY_ID = {
  Electronics: 0,
  Clothing: 1,
  'Home and Kitchen': 2,
  Toys: 3,
  Books: 4,
  Supplements: 5,
  Drugs: 6,
  'Drinks and Food': 7,
  'Pets Good': 8,
  Others: 9,
};

const STATUS_BY_NAME  = {
  'Active': 1,
  'Inactive': 2,
  'Deleted By Admin': 4
}

const STATUS_BY_ID = {
  1: 'Active',
  2: 'Inactive',
  4: 'Deleted By Admin'
}

export default function Product() {
  const theme = useTheme();
  const {data: session, status} = useSession();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [productData, setProductData] = useState({});
  const [productsInSameCategory, setProductsInSameCategory] = useState([]);
  const [productsBySameSeller, setProductsBySameSeller] = useState([]);
  const [quantitySelected, setQuantitySelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const amounts = useSelector(state => state.amounts);
  const cartQty = amounts.cartItems;
  const orderQty = amounts.orderItems;
  const listingQty = amounts.listingItems;
  const sellerPendingQty = amounts.pendingItems;
  const [isErrorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("error message")
  const [isEditMode, setEditMode] = useState(false)
  const [isAvailabilityZero, setAvailabilityZero] = useState(false)

  const isScreenWidthLess1229 = useMediaQuery(theme.breakpoints.down('productDetailsDisplay'))
  const isScreenWidthLess767 = useMediaQuery(theme.breakpoints.down('productDetailsButtons'))

  const formik = useFormik({
    initialValues: {
      productName: '',
      categoryId: '',
      description: '',
      price: '',
      quantity: '',
      status: '',
    },
    validationSchema: Yup.object({
      productName: Yup.string().required('Required')
        .min(3, 'Product Name must be more descriptive')
        .max(50, 'Product Name must be less than 50 characters'),
      description: Yup.string().max(1000, 'Description cannot be more than 1000 characters'),
      price: Yup.string().required('Required').matches(/^\d*(\.?\d?\d?)?$/, "Invalid"),
      quantity: Yup.number().required('Required')
        .max(100, 'Max 100')
        .min(0, "Minimum 0")
        .integer("Invalid")
        .typeError("Invalid"),
      // categoryId: Yup.string().required('Please select a category')
      //   .oneOf(CATEGORIES.map((category) => category.categoryId)),
      // picture: Yup.mixed()
      //   .required('Please submit a product image')
      //   .test(
      //     "FILE_FORMAT",
      //     "Only the following formats are accepted: .jpeg, .jpg, .bmp, .png",
      //     value => isValidFileType(value.name.toLowerCase(), "image")
      //   )
      //   .test(
      //     "FILE_SIZE",
      //     "Image is too large!  Must be less than 1 MB",
      //     value => isValidFileSize(value.file)
      //   )
    }),
    onSubmit: (formValues) => {
      setLoading(true)
      return axios.post(
        `/api/products/edit`,
        {
          ...formValues,
          productId: productData.productId, 
          sellerId: user.userId, 
          categoryId: CATEGORY_ID[formValues.categoryId], 
          status: Number(formValues.quantity) === 0 ? 2 : STATUS_BY_NAME[formValues.status]
        },
        {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
      ).then((response) => {
        if (response.status === 200) {
          setProductData({
            ...productData, 
            productName: formik.values.productName,
            description: formik.values.description,
            price: formik.values.price,
            availableQuantity: formik.values.quantity,
            categoryId: formik.values.categoryId,
            status: formik.values.status,
          })
          setEditMode(false)
          setLoading(false)
        }
      }).catch((err) => {
        setLoading(false)
        console.log(err);
      })
    }
  })

  useEffect(() => {
    setLoading(true)
    axios.post(
      '/api/products',
      {page: 1, productId: router.query.productId},
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      setProductData(response.data.items[0]);
      setAvailabilityZero(response.data.items[0].quantity === 0)
      formik.setValues({...response.data.items[0], status: STATUS_BY_ID[response.data.items[0].status]})
      if (response.status === 200) {
        axios.post(
          '/api/products',
          {
            page: 1,
            categoryId: CATEGORY_ID[response.data.items[0].categoryId],
            status: 1,
            notProductId: router.query.productId
          },
          {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
        ).then((response) => {
          setProductsInSameCategory(response.data.items.filter(item => item.status === 1))
        }).catch((error) => {
          console.log("failed to get items in the same category")
          console.log(error)
        })
        axios.post(
          '/api/products',
          {page: 1, sellerId: response.data.items[0].sellerId, status: 1, notProductId: router.query.productId},
          {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
        ).then((response) => {
          setProductsBySameSeller(response.data.items.filter(item => item.status === 1))
        }).catch((error) => {
          console.log("failed to get items by same seller")
          console.log(error)
        })
        setLoading(false);
      }
    }).catch((err) => {
      setLoading(false);
      console.log(`Error in getting product ${JSON.stringify(err.response)}`);
    })
  }, [router.asPath])

  return (
    <>
      <Head>
        <title>AWExpress - Product</title>
        <meta name="product"/>
        <link rel="icon" href="/favicon.ico?v=2"/>
      </Head>
      <MessageModal open={isErrorOpen} setOpen={setErrorOpen}
                    subject='Oops!'
                    message={errorMessage}
      />
      <Container 
        sx={{
          width: '70%',
          [theme.breakpoints.down('productDetailsContainerMedium')]: {
            width: '85%',
          },
          [theme.breakpoints.down('productDetailsContainerSmall')]: {
            width: '100%',
          },
        }}
      >
        {loading &&
          <Backdrop open={true} sx={{backgroundColor: "rgb(255, 255, 255, 0.6)", zIndex: 99}}>
            <Loader size={10} color={theme.palette.secondary.main}/>
          </Backdrop>
        }
        <BackButton/>
        <Stack id="main-product" direction={isScreenWidthLess1229 ? 'column' : 'row'} spacing={2}
               sx={{
                 bgcolor: 'white',
                 p: '20px',
                 borderRadius: '3px',
                //  minWidth: '1000px',
               }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Box
              component='img'
              src={productData.picture}
              sx={{
                objectFit: 'contain',
                width: '300px',
                height: '350px',
              }}
            />
          </Box>
          <Stack direction="column" >
            <Box sx={{display: productData.status === 4 ? 'flex' : 'none'}}>
              <Typography sx={{color: 'red', fontSize: '20px'}}>This product has been disabled by an administrator</Typography>
            </Box>
            {isEditMode === true ? 
              <TextField name="productName" label="Product Name" defaultValue={formik.values.productName} error={formik.errors.productName} helperText={formik.errors.productName} onChange={formik.handleChange}/>
            :
              <Typography sx={{fontSize: '36px', fontWeight: 'bold', color: theme.palette.secondary.main}}>
                {productData.productName}
              </Typography>
            }
            <Typography sx={{fontSize: '18px', fontWeight: 'light'}}>
              Sold
              by: {productData.sellerFirstName} {productData.sellerLastName} {productData.sellerDepartment === "" ? null : "from " + productData.sellerDepartment}
            </Typography>
            {isEditMode ? 
              <TextField name="categoryId" label='Category' select defaultValue={productData.categoryId} sx={{width: '200px', marginTop: '10px'}} onChange={formik.handleChange}>
                {Object.keys(CATEGORY_ID).map((value, index) => {
                    return <MenuItem key={index} value={value}>{value}</MenuItem>
                })}
              </TextField>
            :
              <Typography sx={{fontSize: '14px', fontWeight: 'light'}}>
                Category: {formik.values.categoryId}
              </Typography>
            }
            <Divider sx={{mt: '8px', mb: '20px'}}/>
            {isEditMode === true ?
              <TextField name="description" label="Description" defaultValue={formik.values.description} multiline rows={3} error={formik.errors.description} helperText={formik.errors.description} onChange={formik.handleChange}/>
            :
              <Typography sx={{fontSize: '16px', mb: '30px'}}>
                {productData.description}
              </Typography>
            }
            {isEditMode === true ?
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <TextField name="price" label="Price" defaultValue={formik.values.price} sx={{marginTop: '10px', marginBottom: '50px', width: '100px'}} error={formik.errors.price} helperText={formik.errors.price} onChange={formik.handleChange}/>
                <TextField disabled={isAvailabilityZero} name="status" select label="Status" value={isAvailabilityZero ? 'Inactive' : formik.values.status} sx={{marginTop: '10px', marginBottom: '50px', width: 'auto'}} onChange={formik.handleChange}>
                  <MenuItem key={1} value={STATUS_BY_ID[1]}>{STATUS_BY_ID[1]}</MenuItem>
                  <MenuItem key={2} value={STATUS_BY_ID[2]}>{STATUS_BY_ID[2]}</MenuItem>
                  {user.userType && user.userType === 'admin' ? 
                    <MenuItem key={4} value={STATUS_BY_ID[4]} sx={{color: 'red'}}>{STATUS_BY_ID[4]}</MenuItem>
                  :
                    null
                  }
                </TextField>
              </Box>
            :
              <Typography variant="h4" sx={{mb: '50px'}}>
                ${Number(productData.price).toFixed(2)}
              </Typography>
            }
            <Box sx={{flexGrow: 1}}/>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                justifyContent: 'flex-end',
                [theme.breakpoints.down('productDetailsButtons')]: {
                  justifyContent: 'flex-start'
                }
              }}
            >
              <Stack direction="column" spacing={1}>
                {isEditMode === true ?
                  <TextField name="quantity" label="Available" defaultValue={formik.values.quantity} sx={{width: '95px', marginRight: 'auto'}} error={formik.errors.quantity} helperText={formik.errors.quantity} 
                    onChange={(event) => {
                      formik.handleChange(event)
                      if (Number(event.target.value) === 0) {
                        setAvailabilityZero(true)
                      } else {
                        setAvailabilityZero(false)
                      }
                    }}/>
                :
                  <>
                  <Typography sx={{fontSize: '16px'}}>
                  Quantity
                  </Typography>
                  <Typography sx={{fontSize: '10px'}}>
                    {productData.availableQuantity} Available
                  </Typography>
                  </>
                }
              </Stack>

              <Select
                defaultValue={1}
                disabled={isEditMode === true}
                sx={{width: '80px'}}
                onChange={(event) => setQuantitySelected(event.target.value)}
              >
                {[...Array(productData.availableQuantity).keys()].map((value, key) => {
                  return (
                    <MenuItem key={key} value={value + 1}>
                      {value + 1}
                    </MenuItem>
                  );
                })}
              </Select>
              {isScreenWidthLess767 ? null :
                <>
                  <Button
                    variant='outlined'
                    disabled={isEditMode === true}
                    sx={{
                      width: '140px',
                      color: theme.palette.secondary.main,
                      borderColor: theme.palette.secondary.main,
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: theme.palette.secondary.main
                      }
                    }}
                    onClick={() => {
                      axios.post(
                        `/api/user/${user.userId}/cart`,
                        {
                          productId:
                          productData.productId,
                          quantity: quantitySelected,
                        },
                        {
                          headers: {
                            'Content-Type': 'application/json',
                            authorization: session.id_token,
                          }
                        }
                      ).then((response) => {
                        dispatch(updateAllAmounts(user.userId, session.id_token));
                      }).catch((error) => {
                        if (error.response.status === 409) {
                          console.log('quantity: ' + error.response.data['quantity']);
                          axios.patch(
                            `/api/user/${user.userId}/cart/${productData.productId}`,
                            {quantity: quantitySelected + error.response.data['quantity']},
                            {
                              headers: {
                                'Content-Type': 'application/json',
                                authorization: session.id_token,
                              },
                            }
                          ).then((response) => {
                            dispatch({type: TRIGGER_CART_UPDATE})
                          }).catch((error) => {
                            console.log('the server could not process add-to-cart due to internal error');
                            console.log(error.response);
                            setErrorMessage(error.response.data['message'])
                            setErrorOpen(true)
                          });
                        } else {
                          console.log('the server could not process add-to-cart due to internal error');
                          console.log(error.response);
                          setErrorMessage(error.response.data['message'])
                          setErrorOpen(true)
                        }
                      });
                    }}
                  >
                  Add To Cart
                </Button>
                <Button
                  variant='contained'
                  disabled={isEditMode === true}
                  sx={{
                    width: '140px',
                    color: theme.palette.secondary.contrastText,
                    bgcolor: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.light,
                    }
                }}
                  onClick={() => {
                    axios.post(
                      `/api/user/${user.userId}/cart`,
                      {
                        productId:
                        productData.productId,
                        quantity: quantitySelected,
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          authorization: session.id_token,
                        }
                      }
                    ).then((response) => {
                      console.log('item quantity has successfully been added to cart');
                      console.log(response);
                      router.push({pathname: '/cart'});
                    }).catch((error) => {
                      if (error.response.status === 409) {
                        console.log('quantity: ' + error.response.data['quantity']);
                        axios.patch(
                          `/api/user/${user.userId}/cart/${productData.productId}`,
                          {quantity: quantitySelected + error.response.data['quantity']},
                          {
                            headers: {
                              'Content-Type': 'application/json',
                              authorization: session.id_token,
                            },
                          }
                        ).then((response) => {
                          console.log('item quantity has successfully been updated');
                          console.log(response);
                          router.push({
                            pathname: '/cart',
                          });
                        }).catch((error) => {
                          console.log('the server could not process add-to-cart due to internal error');
                          console.log(error.response);
                          setErrorMessage(error.response.data['message'])
                          setErrorOpen(true)
                        });
                      } else {
                        console.log('the server could not process add-to-cart due to internal error');
                        console.log(error.response);
                        setErrorMessage(error.response.data['message'])
                        setErrorOpen(true)
                      }
                    });
                  }}
                >
                  Buy It Now
                </Button>
              </>
              
              }
                              
            </Stack>
            {isScreenWidthLess767 == false ? null :
              <Stack direction='column' spacing={2}
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <Button
                  variant='outlined'
                  sx={{
                    width: '100%',
                    height: '50px',
                    color: theme.palette.secondary.main,
                    borderColor: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      borderColor: theme.palette.secondary.main
                    }
                  }}
                  onClick={() => {
                    axios.post(
                      `/api/user/${user.userId}/cart`,
                      {
                        productId:
                        productData.productId,
                        quantity: quantitySelected,
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          authorization: session.id_token,
                        }
                      }
                    ).then((response) => {
                      console.log('item quantity has successfully been added to cart');
                      console.log(response);
                      dispatch(updateAllAmounts(user.userId, session.id_token));
                    }).catch((error) => {
                      if (error.response.status === 409) {
                        console.log('quantity: ' + error.response.data['quantity']);
                        axios.patch(
                          `/api/user/${user.userId}/cart/${productData.productId}`,
                          {quantity: quantitySelected + error.response.data['quantity']},
                          {
                            headers: {
                              'Content-Type': 'application/json',
                              authorization: session.id_token,
                            },
                          }
                        ).then((response) => {
                          dispatch({type: TRIGGER_CART_UPDATE})
                          console.log('item quantity has successfully been updated');
                          console.log(response);
                        }).catch((error) => {
                          console.log('the server could not process add-to-cart due to internal error');
                          console.log(error.response);
                          setErrorOpen(true)
                        });
                      } else {
                        console.log('the server could not process add-to-cart due to internal error');
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
                  width: '100%',
                  height: '50px',
                  color: theme.palette.secondary.contrastText,
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.light,
                  }
                }}
                onClick={() => {
                  axios.post(
                    `/api/user/${user.userId}/cart`,
                    {
                      productId:
                      productData.productId,
                      quantity: quantitySelected,
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        authorization: session.id_token,
                      }
                    }
                  ).then((response) => {
                    router.push({pathname: '/cart'});
                  }).catch((error) => {
                    if (error.response.status === 409) {
                      console.log('quantity: ' + error.response.data['quantity']);
                      axios.patch(
                        `/api/user/${user.userId}/cart/${productData.productId}`,
                        {quantity: quantitySelected + error.response.data['quantity']},
                        {
                          headers: {
                            'Content-Type': 'application/json',
                            authorization: session.id_token,
                          },
                        }
                      ).then((response) => {
                        router.push({
                          pathname: '/cart',
                        });
                      }).catch((error) => {
                        console.log('the server could not process add-to-cart due to internal error');
                        console.log(error.response);
                        setErrorOpen(true)
                      });
                    } else {
                      console.log('the server could not process add-to-cart due to internal error');
                      console.log(error.response);
                      setErrorOpen(true)
                    }
                  });
                }}
              >
                Buy It Now
              </Button>
            </Stack>
            }
          </Stack>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end',
            marginTop: '10px',
            gap: '10px'
          }}
        >
          {(productData.sellerId === user.userId && productData.status !== 4) || (user.userType && user.userType === 'admin') ?
            isEditMode === true ?
              <>
                <Button
                  variant='contained'
                  disabled={Object.keys(formik.errors).length !== 0}
                  sx={{}}
                  onClick={() => {
                    formik.submitForm()
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant='contained'
                  sx={{}}
                  onClick={() => {
                    setEditMode(false)
                  }}
                >
                  Cancel
                </Button>
              </> 
            :
              <Button
                variant='contained'
                sx={{}}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                Edit Post
              </Button>
            
          : 
            null
          }
        </Box>
        <Box 
          sx={{
            display: Object.keys(formik.errors).length === 0 || isEditMode === false ? 'none' : 'flex',
            width: '100%',
            justifyContent: 'flex-end',
            marginTop: '10px',
          }}>
            <Typography sx={{fontSize: '12px', color: 'red'}}>A field is invalid</Typography>
        </Box>
        {user.userType && user.userType === 'admin' &&
          <RemovePostButton productId={productData.productId} id_token={session.id_token}/>
        }

        <Stack direction='column' spacing={5} sx={{mt: '50px'}}>
          {productsBySameSeller.length > 0 &&
            <ProductsBar
              products={productsBySameSeller}
              title="Other Products By This Seller"
              subtitle={(productData.sellerFirstName || productData.sellerLastName) && `Browse other items from ${productData.sellerFirstName} ${productData.sellerLastName}`}
            />
          }

          {productsInSameCategory.length > 0 &&
            <ProductsBar
              products={productsInSameCategory}
              title="Similar Items"
              subtitle={`Browse other items in ${productData.categoryId}`}
            />
          }
        </Stack>

      </Container>
    </>
  );
}

Product.getLayout = (page) => {
  return <NavbarLayout>{page}</NavbarLayout>;
};
