import NavbarLayout from '../layouts/Navbar';
import Loader from '../components/utilities/loader';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import * as React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CountrySelect from '../components/CountrySelect';
import { useDispatch } from 'react-redux';
import { updateAllAmounts } from '../actions/amounts';
import {useMediaQuery} from '@mui/material';
import {
  Button,
  TextField,
  Container,
  Divider,
  List,
  ListItem,
  Typography,
  Box,
  Backdrop,
  Select,
  MenuItem,
  Menu,
  InputLabel,
  FormControl,
  Stack
} from '@mui/material';
import BackButton from "../components/utilities/BackButton";
import Head from "next/head";
import MessageModal from '../components/MessageModal';

const PROVINCE_TAXES = {
  "Alberta": 0.05,
  "British Columbia": 0.12,
  "Manitoba": 0.12,
  "New Brunswick": 0.15,
  "Newfoundland and Labrador": 0.15,
  "Northwest Territories": 0.05,
  "Nova Scotia": 0.15,
  "Nunavut": 0.05,
  "Ontario": 0.13,
  "Prince Edward Island": 0.15,
  "Quebec": 0.14975,
  "Saskatchewan": 0.11,
  "Yukon": 0.05,
}

const defaultFormValuesForTesting = {
  phoneNumber: '1231231234',
  emailAddress: 'email@email.com',
  shippingName: 'Shipping Name',
  shippingCountry: 'Shipping Country',
  shippingRegion: 'Shipping Province',
  shippingMunicipality: 'Shipping City',
  shippingPostalCode: 'A1A1A1',
  shippingStreetAddress: 'Shipping Street Address',
  shippingExtraAddressInfo: '',
  billingName: 'Billing Name',
  billingCountry: 'Billing Country',
  billingRegion: 'Billing Province',
  billingMunicipality: 'Billing City',
  billingPostalCode: 'A1A1A1',
  billingStreetAddress: 'Billing Street Address',
  billingExtraAddressInfo: '',
  cardName: 'Card Name',
  cardNumber: '1234123412341234',
  cardExpiry: '1234',
  cardSecurity: '123',
  additionalInformation: '',
};

const textFieldStyle = {
  width: '100%',
  size: 'medium',
};

const sectionTitleTextStyle = {
  fontSize: '24px',
  mt: '30px',
};

const textFieldErrorTextStyle = {
  fontSize: '12px',
  color: 'red',
  mt: '-10px',
};

let shopping_cart_quantity;
export default function Checkout() {
  const theme = useTheme();
  const isPriceBoxOverflow = useMediaQuery(theme.breakpoints.down('checkoutMedium'))
  const isFormTooLarge = useMediaQuery(theme.breakpoints.down('checkoutSmall'))
  const isBillingCopyButtonOverFlow = useMediaQuery(theme.breakpoints.down('checkoutTiny'))
  const [loading, setLoading] = useState(false);
  const {data: session, status} = useSession();
  const user = useSelector((state) => state.auth.user);
  const amounts = useSelector(state => state.amounts);
  const cartUpdateListener = amounts.cartUpdateListener
  const cartQty = amounts.cartQty
  const dispatch = useDispatch();
  const [initialCart, setInitialCart] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [taxes, setTaxes] = useState(0.12)
  const [shippingCost, setShippingCost] = useState(12.59);
  const [payNowWasClicked, setPayNowWasClicked] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [userData, setUserData] = useState({})
  const [isServerError, setServerError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("An unexpected error has occurred")
  const date = new Date()
  const currentDateInMMYY = ((date.getMonth() + 1) * 100) + date.getFullYear() % 1000
  console.log(((date.getMonth() + 1) * 100) + date.getFullYear() % 1000)
  const formik = useFormik({
    initialValues: {
      phoneNumber: '',
      emailAddress: '',
      shippingName: '',
      shippingCountry: 'Canada',
      shippingRegion: '',
      shippingMunicipality: '',
      shippingPostalCode: '',
      shippingStreetAddress: '',
      shippingExtraAddressInfo: '',
      billingName: '',
      billingCountry: '',
      billingRegion: '',
      billingMunicipality: '',
      billingPostalCode: '',
      billingStreetAddress: '',
      billingExtraAddressInfo: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardSecurity: '',
      additionalInformation: '',
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string()
        .matches(
          /^\d+$/,
          'Phone number can only contain numbers (no spaces or hyphens)'
        )
        .max(10, 'Phone number must be 10 digits')
        .min(10, 'Phone number must be 10 digits')
        .required('Phone number is required'),
      emailAddress: Yup.string()
        .max(
          254,
          'Email address must be less than 254 characters. Why is your email address so long anyway?!?'
        )
        .email(
          'Email address must be formatted correctly (e.g. example@email.com)'
        )
        .required('Email address is required'),
      shippingName: Yup.string()
        .max(
          100,
          'Recipient name must be less than 100 characters. Bruh is that really your name?'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Recipient name can only contain Latin characters'
        )
        .required('Recipient name is required'),
      shippingCountry: Yup.string()
        .max(
          56,
          'Recipient Country must be less than 57 characters. The United Kingdom of Great Britain and Northern Ireland has the longest official name!'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Country can only contain Latin characters'
        )
        .required('Country of shipping address is required'),
      shippingRegion: Yup.string()
        .max(
          100,
          "Recipient Province/State must be less than 100 characters. There ain't no way your Province has such a long name!"
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Province/State can only contain Latin characters'
        )
        .required('Province/State of shipping address is required'),
      shippingMunicipality: Yup.string()
        .max(
          100,
          'Recipient City must be less than 100 characters. What kind of city has such a long name?'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'City can only contain Latin characters'
        )
        .required('City of shipping address is required'),
      shippingStreetAddress: Yup.string()
        .max(
          100,
          "Shipping street address must be less than 100 characters. Ok that's gotta be a fake address"
        )
        .max(
          200,
          'Shipping street address must be less than 200 characters'
        )
        .required('Shipping street address is required'),
      shippingExtraAddressInfo: Yup.string().max(
        100,
        'Extra address details must be less than 100 characters'
      ),
      shippingPostalCode: Yup.string()
        .matches(
          /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
          'Postal code must be in Canadian format A1A1A1 (A=letter, 1=number)'
        )
        .required('Postal code of shipping address is required'),
      billingName: Yup.string()
        .max(
          100,
          'Billing address name must be less than 100 characters. Bruh is that really your name?'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Card owner name can only contain Latin characters'
        )
        .required('A recipient name is required'),
      billingCountry: Yup.string()
        .max(
          56,
          'Recipient Country must be less than 57 characters. The United Kingdom of Great Britain and Northern Ireland has the longest official name!'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Country can only contain Latin characters'
        )
        .required('Country of billing address is required'),
      billingRegion: Yup.string()
        .max(
          100,
          "Recipient Province/State must be less than 100 characters. There ain't no way your Province has such a long name!"
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Province/State can only contain Latin characters'
        )
        .required('Province/State of billing address is required'),
      billingMunicipality: Yup.string()
        .matches(
          /^[A-Za-z\s]+$/,
          'City can only contain Latin characters'
        )
        .required('City of billing address is required'),
      billingStreetAddress: Yup.string()
        .max(
          100,
          "Shipping street address must be less than 100 characters. Ok that's gotta be a fake address"
        )
        .max(
          200,
          'Billing street address must be less than 200 characters'
        )
        .required('Billing street address is required'),
      billingExtraAddressInfo: Yup.string().max(
        100,
        'Extra address details must be less than 100 characters'
      ),
      billingPostalCode: Yup.string()
        .matches(
          /^[A-Za-z0-9\s]+$/,
          'Billing postal code can only contain letters and numbers'
        )
        .required('Postal code of billing address is required'),
      cardName: Yup.string()
        .max(
          100,
          'Card name must be less than 100 characters. How does that even fit on your credit card?!?'
        )
        .matches(
          /^[A-Za-z\s]+$/,
          'Card name can only contain Latin characters'
        )
        .required('Name of cardholder is required'),
      cardNumber: Yup.string()
        .matches(
          /^\d+$/,
          'Card number can only contain numbers (no spaces or hyphens)'
        )
        .min(16, 'Card number must be 16 digits')
        .max(16, 'Card number must be 16 digits')
        .required('Card number is required'),
      cardExpiry: Yup.number()
        .min(currentDateInMMYY, "Card must not be expired")
        .min(1000, "Card expiry must be 4 digits in MMYY format")
        .max(1299, "Card expiry month is invalid")
        .required("Card expiry date is required"),
      // cardExpiry: Yup.string()
      //   .matches(
      //     /^\d+$/,
      //     'Card expiry date can only contain numbers (no spaces or hyphens)'
      //   )
      //   .max(4, 'Card expiry date must be in the format MMYY with no /')
      //   .min(4, 'Card expiry date must be in the format MMYY with no /')
      //   .required('Card expiry date is required'),
      cardSecurity: Yup.string()
        .matches(
          /^\d+$/,
          'Card security code can only contain numbers (no spaces or hyphens)'
        )
        .max(3, 'Card security code must contain 3 digits')
        .min(3, 'Card security code must contain 3 digits')
        .required('Card security code is required'),
      additionalInformation: Yup.string().max(
        500,
        'Message must be less than 500 characters. You writing an essay or something?'
      ),
    }),
    onSubmit: (formValues) => {
      setLoading(true);
      if (status === 'authenticated') {
        axios
          .post(
            `/api/user/${user.userId}/checkout`,
            {
              userId: user.userId,
              productIdsAndQuantity: initialCart,
              ...formValues,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                authorization: session.id_token,
              },
            }
          )
          .then((response) => {
            // dispatch(updateAllAmounts(user.userId, session.id_token))
            console.log(response.data['orderId']);
            axios
              .post(
                `/api/shipping`,
                {
                  input: `{\"orderId\": ${response.data['orderId']}}`,
                  stateMachineArn:
                    'arn:aws:states:us-east-1:382691565928:stateMachine:ShippingStateMachine',
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    authorization: session.id_token,
                  },
                }
              )
              .then((response) => {
                console.log(response);
                setLoading(false);
                Router.push('/payconfirm');
              })
              .catch((error) => {
                setLoading(false);
                console.log(error);
                setErrorMessage(error.response.data['message'])
                setServerError(true)
                // setPaymentError('Error: Shipping Function');
              });
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
            setErrorMessage(error.response.data['message'])
            setServerError(true)
            // setPaymentError('Error: ConfirmPayment Function');
          });
      }
    },
  });
  useEffect(() => {
    let subTotalCounter = 0;
    if (status === 'authenticated') {
      axios
        .get(`/api/user/${user.userId}/cart/`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: session.id_token,
          },
        })
        .then((response) => {
          let shopping_cart_items = [];
          //for loop
          response.data['items'].map((res_item) => {
            // shopping_cart_items.push({
            //     productId: res_item['productId'],
            //     productName: res_item['productName'],
            //     price: res_item['price'],
            //     quantity: res_item['quantity'],
            //     picture: res_item['picture'],
            // });
            subTotalCounter =
              subTotalCounter +
              res_item['price'] * res_item['quantity'];
          });
          shopping_cart_quantity = shopping_cart_items.length;
          setInitialCart(response.data['items']);
          setSubTotal(subTotalCounter);
        })
        .catch((err) => {
          console.log(
            `Error in getting cart info with error ${JSON.stringify(
              err.response
            )}`
          );
        });
    } else {
      setInitialCart([]);
    }
  }, [cartQty, amounts.cartUpdateListener]);
  useEffect(() => {
    if (status === 'authenticated') {
      axios.get(
        `/api/user/${user.userId}/`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: session.id_token,
          },
        }
      ).then((response) => {
        formik.setFieldValue('emailAddress', response.data.userEmail)
        formik.setFieldValue('shippingName', `${response.data.firstname} ${response.data.lastname}`)
        formik.setFieldValue('shippingCountry', "Canada")
        formik.setFieldValue('shippingRegion', "British Columbia")
        formik.setFieldValue('shippingMunicipality', response.data.address.city)
        formik.setFieldValue('shippingStreetAddress', response.data.address.street)
        formik.setFieldValue('shippingPostalCode', response.data.address.postal)
        formik.setFieldValue('billingName', `${response.data.firstname} ${response.data.lastname}`)
        formik.setFieldValue('billingCountry', "Canada")
        formik.setFieldValue('billingRegion', response.data.address.province)
        formik.setFieldValue('billingMunicipality', response.data.address.city)
        formik.setFieldValue('billingStreetAddress', response.data.address.street)
        formik.setFieldValue('billingPostalCode', response.data.address.postal)
        formik.setFieldValue('cardName', `${response.data.firstname} ${response.data.lastname}`)
      }).catch((error) => {
        console.log("could not retrieve user data")
        console.log(error)
      })
    }
  }, [])

  const copyShippingToBilling = () => {
    formik.setFieldValue('billingName', formik.values.shippingName).then(() => {
      formik.validateField('billingName')
    })
    formik.setFieldValue('billingCountry', formik.values.shippingCountry).then(() => {
      formik.validateField('billingCountry')
    })
    formik.setFieldValue('billingRegion', formik.values.shippingRegion).then(() => {
      formik.validateField('billingRegion')
    })
    formik.setFieldValue('billingMunicipality', formik.values.shippingMunicipality).then(() => {
      formik.validateField('billingMunicipality')
    })
    formik.setFieldValue('billingStreetAddress', formik.values.shippingStreetAddress).then(() => {
      formik.validateField('billingStreetAddress')
    })
    formik.setFieldValue('billingExtraAddressInfo', formik.values.shippingExtraAddressInfo).then(() => {
      formik.validateField('billingExtraAddressInfo')
    })
    formik.setFieldValue('billingPostalCode', formik.values.shippingPostalCode).then(() => {
      formik.validateField('billingPostalCode')
    })
  }

  const handleBillingCountryChange = (value) => {
    formik.setFieldValue('billingCountry', value, true)
  }

  const handleBillingCountryTouched = () => {
    formik.setFieldTouched('billingCountry', true, true)
  }

    return (
        <Container>
          <Head>
            <title>AWExpress - Checkout</title>
            <meta name="checkout"/>
            <link rel="icon" href="/favicon.ico?v=2"/>
          </Head>
            {loading && (
                <Backdrop
                    open={true}
                    sx={{
                        backgroundColor: 'rgb(255, 255, 255, 0.6)',
                        zIndex: 99,
                    }}
                >
                    <Loader size={10} color={theme.palette.secondary.main} />
                </Backdrop>
            )}
            <MessageModal open={isServerError} setOpen={setServerError}
                subject='Oops!'
                message={errorMessage}
            ></MessageModal>
            {/* {paymentError === '' ? null : (
                <Typography sx={{ fontSize: '60px', color: 'red' }}>
                    {paymentError}
                </Typography>
            )} */}
                <Stack
                  direction="column"
                >
                    <BackButton />
                    <Typography variant='h3' sx={{color: theme.palette.secondary.main, mb: '20px'}}>Checkout</Typography>
                  <Stack direction={isPriceBoxOverflow ? 'column-reverse' : 'row'} spacing={5} sx={{width: '100%'}}>
                    <Stack direction={isFormTooLarge ? 'column' : 'row'} spacing={5} 
                        sx={{
                            width: '100%', 
                            minWidth: '700px', 
                            bgcolor: '#f5f5f5', 
                            p: '10px', 
                            borderRadius: '3px',
                            [theme.breakpoints.down('checkoutMedium')]: {
                                minWidth: '0'
                            },
                        }}
                    >
                      <Stack direction="column" sx={{width: '100%'}}>
                              <Typography sx={sectionTitleTextStyle}>
                                  Contact Information
                              </Typography>
                          <Divider sx={{mb: '20px'}}/>
                              <Box
                                  sx={{
                                      position: 'relative',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '16px',
                                  }}
                              >
                                  <TextField
                                      label='Phone Number'
                                      name='phoneNumber'
                                      value={formik.values.phoneNumber}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                      onChange={(event) => {
                                        event.preventDefault();
                                        const { value } = event.target;
                                        const regex = /^\d{0,10}$/;
                                        if (regex.test(value.toString())) formik.setFieldValue("phoneNumber", value);
                                      }}
                                  />
                                  {formik.errors.phoneNumber &&
                                  formik.touched.phoneNumber ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.phoneNumber}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='Email'
                                      name='emailAddress'
                                      value={formik.values.emailAddress}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                  />
                                  {formik.errors.emailAddress &&
                                  formik.touched.emailAddress ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.emailAddress}
                                      </Typography>
                                  ) : null}
                              </Box>
                              <Typography sx={sectionTitleTextStyle}>
                                  Shipping Address
                              </Typography>
                          <Divider sx={{mb: '20px'}}/>
                              <Box
                                  sx={{
                                      position: 'relative',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '16px',
                                  }}
                              >
                                  <TextField
                                      label='Full Name Of Recipient'
                                      name='shippingName'
                                      value={formik.values.shippingName}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                      onChange={(event) => {
                                        event.preventDefault();
                                        const { value } = event.target;
                                        const regex = /^[a-zA-Z ,.'-]*$/;
                                        if (regex.test(value.toString())) formik.setFieldValue("shippingName", value);
                                      }}
                                  />
                                  {formik.errors.shippingName &&
                                  formik.touched.shippingName ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingName}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='Country'
                                      name='shippingCountry'
                                      value={formik.values.shippingCountry}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                      disabled={true}
                                  />
                                  {formik.errors.shippingCountry &&
                                  formik.touched.shippingCountry ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingCountry}
                                      </Typography>
                                  ) : null}
                                  {/* <TextField
                                      label='Province/State'
                                      name='shippingRegion'
                                      value={formik.values.shippingRegion}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                  /> */}
                                  <FormControl>
                                      <InputLabel id='provincesLabel'>Province/Territory</InputLabel>
                                      <Select
                                          labelId='provincesLabel'
                                          label='Province/State'
                                          name='shippingRegion'
                                          value={formik.values.shippingRegion}
                                          onChange={(event) => {
                                              formik.handleChange(event)
                                              setTaxes(PROVINCE_TAXES[event.target.value])
                                          }}
                                          onBlur={formik.handleBlur}
                                          sx={textFieldStyle}
                                      >
                                          {Object.keys(PROVINCE_TAXES).map((province, index) => {
                                              return <MenuItem key={index} value={province}>{province}</MenuItem>
                                          })}
                                      </Select>
                                  </FormControl>
                                  {formik.errors.shippingRegion &&
                                  formik.touched.shippingRegion ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingRegion}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='City'
                                      name='shippingMunicipality'
                                      value={formik.values.shippingMunicipality}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                  />
                                  {formik.errors.shippingMunicipality &&
                                  formik.touched.shippingMunicipality ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingMunicipality}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='Street Address'
                                      name='shippingStreetAddress'
                                      value={formik.values.shippingStreetAddress}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                  />
                                  {formik.errors.shippingStreetAddress &&
                                  formik.touched.shippingStreetAddress ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingStreetAddress}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='Extra Address Details (Optional)'
                                      name='shippingExtraAddressInfo'
                                      value={
                                          formik.values.shippingExtraAddressInfo
                                      }
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                  />
                                  {formik.errors.shippingExtraAddressInfo &&
                                  formik.touched.shippingExtraAddressInfo ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingExtraAddressInfo}
                                      </Typography>
                                  ) : null}
                                  <TextField
                                      label='Postal Code'
                                      name='shippingPostalCode'
                                      value={formik.values.shippingPostalCode}
                                      onBlur={formik.handleBlur}
                                      sx={textFieldStyle}
                                      onChange={(event) => {
                                        event.preventDefault();
                                        const { value } = event.target;
                                        const regex = /^\w*$/;
                                        if (regex.test(value.toString())) formik.setFieldValue("shippingPostalCode", value);
                                      }}
                                  />
                                  {formik.errors.shippingPostalCode &&
                                  formik.touched.shippingPostalCode ? (
                                      <Typography sx={textFieldErrorTextStyle}>
                                          {formik.errors.shippingPostalCode}
                                      </Typography>
                                  ) : null}
                              </Box>
                      </Stack>
                      <Stack direction="column" sx={{width: '100%'}}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              [theme.breakpoints.down('checkoutTiny')]: {
                                flexDirection: 'column'
                              }
                            }}
                          >
                            <Typography sx={sectionTitleTextStyle}>
                              Billing Address
                            </Typography>
                            <Button
                              variant='outlined'
                              sx={{
                                fontSize: '12px',
                                height: '30px',
                                alignSelf: 'flex-end',
                                [theme.breakpoints.down('checkoutTiny')]: {
                                    alignSelf: 'flex-start'
                                  }
                              }}
                              onClick={copyShippingToBilling}
                            >
                              Same As Shipping
                            </Button>
                          </Box>
                        <Divider sx={{mb: '20px'}}/>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                            }}
                          >
                            <TextField
                              label='Full Name Of Card Owner'
                              name='billingName'
                              value={formik.values.billingName}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^[a-zA-Z ,.'-]*$/;
                                if (regex.test(value.toString())) formik.setFieldValue("billingName", value);
                              }}
                            />
                            {formik.errors.billingName &&
                            formik.touched.billingName ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingName}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Country'
                              name='billingCountry'
                              value={formik.values.billingCountry}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                            />
                            {/* <CountrySelect
                                      label='Country'
                                      name='billingCountry'
                                      value={formik.values.billingCountry}
                                      onChange={handleBillingCountryChange}
                                      onBlur={handleBillingCountryTouched}
                                  /> */}
                            {formik.errors.billingCountry &&
                            formik.touched.billingCountry ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingCountry}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Province/State'
                              name='billingRegion'
                              value={formik.values.billingRegion}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                            />
                            {formik.errors.billingRegion &&
                            formik.touched.billingRegion ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingRegion}
                              </Typography>
                            ) : null}
                            <TextField
                              label='City'
                              name='billingMunicipality'
                              value={formik.values.billingMunicipality}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                            />
                            {formik.errors.billingMunicipality &&
                            formik.touched.billingMunicipality ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingMunicipality}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Street Address'
                              name='billingStreetAddress'
                              value={formik.values.billingStreetAddress}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                            />
                            {formik.errors.billingStreetAddress &&
                            formik.touched.billingStreetAddress ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingStreetAddress}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Extra Address Details (Optional)'
                              name='billingExtraAddressInfo'
                              value={
                                formik.values.billingExtraAddressInfo
                              }
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                            />
                            {formik.errors.billingExtraAddressInfo &&
                            formik.touched.billingExtraAddressInfo ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingExtraAddressInfo}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Postal Code'
                              name='billingPostalCode'
                              value={formik.values.billingPostalCode}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^\w*$/;
                                if (regex.test(value.toString())) formik.setFieldValue("billingPostalCode", value);
                              }}
                            />
                            {formik.errors.billingPostalCode &&
                            formik.touched.billingPostalCode ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.billingPostalCode}
                              </Typography>
                            ) : null}
                          </Box>
                          <Typography sx={sectionTitleTextStyle}>
                            Payment
                          </Typography>
                        <Divider sx={{mb: '20px'}}/>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                            }}
                          >
                            <TextField
                              label='Card Number'
                              name='cardNumber'
                              value={formik.values.cardNumber}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^\d{0,16}$/;
                                if (regex.test(value.toString())) formik.setFieldValue("cardNumber", value);
                              }}
                            />
                            {formik.errors.cardNumber &&
                            formik.touched.cardNumber ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.cardNumber}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Name On Card'
                              name='cardName'
                              value={formik.values.cardName}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^[a-zA-Z -]*$/;
                                if (regex.test(value.toString())) formik.setFieldValue("cardName", value);
                              }}
                            />
                            {formik.errors.cardName &&
                            formik.touched.cardName ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.cardName}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Expiry Date'
                              name='cardExpiry'
                              value={formik.values.cardExpiry}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^\d{0,4}$/;
                                if (regex.test(value.toString())) formik.setFieldValue("cardExpiry", value);
                              }}
                            />
                            {formik.errors.cardExpiry &&
                            formik.touched.cardExpiry ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.cardExpiry}
                              </Typography>
                            ) : null}
                            <TextField
                              label='Security Code'
                              name='cardSecurity'
                              value={formik.values.cardSecurity}
                              onBlur={formik.handleBlur}
                              sx={textFieldStyle}
                              onChange={(event) => {
                                event.preventDefault();
                                const { value } = event.target;
                                const regex = /^\d{0,3}$/;
                                if (regex.test(value.toString())) formik.setFieldValue("cardSecurity", value);
                              }}
                            />
                            {formik.errors.cardSecurity &&
                            formik.touched.cardSecurity ? (
                              <Typography sx={textFieldErrorTextStyle}>
                                {formik.errors.cardSecurity}
                              </Typography>
                            ) : null}
                          </Box>
                      </Stack>
                    </Stack>
                    <Box sx={{flexGrow: 1}} />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '250px',
                        mt: '100px',
                        gap: '16px',
                        p: '10px',
                        borderRadius: '5px',
                        bgcolor: 'white'
                      }}
                    >
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ fontSize: '1rem', width: '6rem' }}>
                          Subtotal:
                        </Typography>
                        <Typography sx={{ fontSize: '1rem' }}>
                          ${subTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ fontSize: '1rem', width: '6rem' }}>
                          Taxes:
                        </Typography>
                        <Typography sx={{ fontSize: '1rem' }}>
                          ${(subTotal * taxes).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ fontSize: '1rem', width: '6rem' }}>
                          Shipping:
                        </Typography>
                        <Typography sx={{ fontSize: '1rem' }}>
                          {shippingCost < 0 ? 'TBD' : '$' + shippingCost}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ fontSize: '1rem', width: '6rem' }}>
                          Total:
                        </Typography>
                        <Typography sx={{ fontSize: '1rem' }}>
                          $
                          {(
                            subTotal +
                            subTotal * taxes +
                            (shippingCost < 0 ? 0 : shippingCost)
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        variant='contained'
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          '&:hover': {
                            bgcolor: theme.palette.secondary.light,
                          }
                        }}
                        disabled={
                          (Object.keys(formik.errors).length > 0 &&
                            payNowWasClicked) ||
                          initialCart.length <= 0
                        }
                        onClick={() => {
                          formik.submitForm();
                          setPayNowWasClicked(true);
                        }}
                      >
                        Pay Now
                      </Button>
                      {Object.keys(formik.errors).length > 0 &&
                      payNowWasClicked ? (
                        <Typography sx={textFieldErrorTextStyle}>
                          A required field is invalid
                        </Typography>
                      ) : null}
                      {initialCart.length <= 0 ? (
                        <Typography sx={textFieldErrorTextStyle}>
                          Your cart is empty
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                  <Stack direction="column">
                      <Typography sx={sectionTitleTextStyle}>
                        Additional Information
                      </Typography>
                    <Divider sx={{mb: '20px'}}/>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                    >
                      <TextField
                        label='Notes For The Seller'
                        name='additionalInformation'
                        value={formik.values.additionalInformation}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        multiline
                        rows={6}
                        sx={textFieldStyle}
                      />
                      {formik.errors.additionalInformation &&
                      formik.touched.additionalInformation ? (
                        <Typography sx={textFieldErrorTextStyle}>
                          {formik.errors.additionalInformation}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                </Stack>

        </Container>
    );
}

Checkout.getLayout = (page) => {
  return <NavbarLayout>{page}</NavbarLayout>;
};
