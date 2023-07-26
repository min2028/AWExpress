import * as Yup from 'yup';
import {styled, useTheme} from "@mui/material/styles";
import axios from "axios";
import {useFormik, Form, FormikProvider} from 'formik';
import {Box, Button, Divider, Stack, TextField, Typography, MenuItem, IconButton, InputAdornment, useMediaQuery} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {createRef, useEffect, useRef, useState} from "react";
import {useSelector} from 'react-redux';
import {useRouter} from "next/router";
import UploadIcon from '@mui/icons-material/Upload';
import Loader from "../utilities/loader";

const CATEGORIES = [
  {categoryId: '0', name: 'Electronics'},
  {categoryId: '1', name: 'Clothing'},
  {categoryId: '2', name: 'Home & Kitchen'},
  {categoryId: '3', name: 'Toys'},
  {categoryId: '4', name: 'Books'},
  {categoryId: '5', name: 'Supplements'},
  {categoryId: '6', name: 'Drugs'},
  {categoryId: '7', name: 'Food & Drink'},
  {categoryId: '8', name: 'Pet Goods'},
  {categoryId: '9', name: 'Other'},
]

const MAX_FILE_SIZE = 1024000;

const SUPPORTED_FORMATS = {
  image: [
    'jpg',
    'jpeg',
    'png',
  ]
};

function isValidFileType(fileName, fileType) {
  return fileName && SUPPORTED_FORMATS[fileType].indexOf(fileName.split('.').pop()) > -1
}

function isValidFileSize(fileString) {
  return (fileString.length * (3/4)) <= MAX_FILE_SIZE
}


const RootStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    width: "90%",
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#f3f3f3',
    borderRadius: '5px',
    paddingBottom: '20px',
}));

const buttonStyle = {
  float: 'right',
  marginRight: '5%',
  height: 40,
  width: 120
};

const sectionStyle = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '90%',
  marginBottom: 6,
}

const inputTextStyle = {
  input: {color: 'primary.darker'}
}

export default function SellForm(props) {
  const router = useRouter()
  const theme = useTheme();
  const ref = useRef();
  const user = useSelector(state => state.auth.user);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isFileTooLarge, setFileTooLarge] = useState(false);

  const isImagePreviewTooBig = useMediaQuery(theme.breakpoints.down('sellFormImagePreview'))


  const [initialValues, setInitialValues] = useState({
    productName: '',
    description: '',
    price: '',
    quantity: 1,
    categoryId: '',
    picture: null, //{file: <base64 string>, name: <file name>}
  })

  const SellFormSchema = Yup.object().shape({
    productName: Yup.string().required('Product Name is required')
      .min(3, 'Product Name must be more descriptive')
      .max(50, 'Product Name must be less than 50 characters'),
    description: Yup.string().max(1000, 'Description cannot be more than 1000 characters'),
    price: Yup.string().required('Price is required').matches(/^\d*(\.?\d?\d?)?$/, "Price must be a postive number with up to 2 decimal places"),
    quantity: Yup.number().required('Please select a quantity')
      .max(100, 'Only a max of 100 is allowed')
      .positive("Only positive values are allowed").integer("Please enter a whole number"),
    categoryId: Yup.string().required('Please select a category')
      .oneOf(CATEGORIES.map((category) => category.categoryId)),
    picture: Yup.mixed()
      .required('Please submit a product image')
      .test(
        "FILE_FORMAT",
        "Only the following formats are accepted: .jpeg, .jpg, .bmp, .png",
        value => isValidFileType(value.name.toLowerCase(), "image")
      )
      .test(
        "FILE_SIZE",
        "Image is too large!  Must be less than 1 MB",
        value => isValidFileSize(value.file)
      )
  });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: SellFormSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      props.setProductLoading(true);
      const remainingValues = Object.assign({}, values);
      // // remove blank or unchanged values
      // Object.keys(remainingValues).forEach(key => {
      //   if (remainingValues[key] === '' || remainingValues[key] === initialValues[`${key}`]) delete remainingValues[key];
      // })

      return axios.post(
        `/api/products/add`,
        {...remainingValues, sellerId: user.userId},
        {headers: {'Content-Type': 'application/json', 'authorization': props.id_token}}
      ).then((response) => {
        if (response.status === 200) {
          setComplete(true);
          setError(false);
          props.setProductLoading(false);
          router.push(
            {
              pathname: '/product',
              query: {productId: response.data.productId,}
            }, `/product/${response.data.productId}`)
        }
      }).catch((err) => {
        props.setProductLoading(false);
        setError(true);
        console.log(`Error in posting product with error ${JSON.stringify(err.response.data)}`);
      })
    }
  });

  const {
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    resetForm,
    setFieldValue
  } = formik;

  return (
    <RootStyle>
      <Box sx={{width: '100%', borderRadius: 1}}>
        <Box sx={{
          display: 'flex',
          height: '80px',
          backgroundColor: theme.palette.secondary.main,
          pl: '20px',
          pr: '20px',
          alignItems: 'flex-end',
          mb: '50px',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}>
          <Typography variant="h4" sx={{color: theme.palette.background.default}}>
            Product Details
          </Typography>
        </Box>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack spacing={3} sx={sectionStyle}>
              <TextField
                sx={{...inputTextStyle}}
                variant='standard'
                fullWidth
                label="Product Name"
                {...getFieldProps('productName')}
                error={Boolean(touched.productName && errors.productName)}
                helperText={touched.productName && errors.productName}
              />
              <TextField
                multiline
                rows={5}
                sx={{...inputTextStyle}}
                variant='outlined'
                fullWidth
                label="Description"
                {...getFieldProps('description')}
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
              />
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                  select
                  sx={{...inputTextStyle}}
                  variant='standard'
                  fullWidth
                  label="Category"
                  {...getFieldProps('categoryId')}
                  error={Boolean(touched.categoryId && errors.categoryId)}
                  helperText={touched.categoryId && errors.categoryId}
                >
                  {CATEGORIES.map((category, key) => (
                    <MenuItem key={key} value={category.categoryId} label={category.name}>{category.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  sx={{...inputTextStyle}}
                  variant='standard'
                  label="Price"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                  {...getFieldProps('price')}
                  error={Boolean(touched.price && errors.price)}
                  helperText={touched.price && errors.price}
                  onChange={(event) => {
                    event.preventDefault();
                    const { value } = event.target;
                    const regex = /^\d*\.?\d{0,2}$/;
                    if (regex.test(value.toString())) setFieldValue("price", value);
                  }}
                />
                <TextField
                  type="number"
                  sx={{...inputTextStyle}}
                  variant='standard'
                  label="Quantity"
                  InputProps={{inputProps: {min: 1}}}
                  {...getFieldProps('quantity')}
                  error={Boolean(touched.quantity && errors.quantity)}
                  helperText={touched.quantity && errors.quantity}
                />
              </Stack>

              <Stack
                direction={isImagePreviewTooBig ? 'column' : 'row'}
                spacing={4}
                sx={{pt: '20px'}}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  width: '200px',
                  border: 2,
                  borderRadius: 3,
                  borderColor: 'grey.500'
                }}>
                  {!preview && <Typography variant='h6' sx={{color: 'lightgrey'}}>Image Preview</Typography>}
                  {preview &&
                    <Box
                      component='img'
                      src={preview.picture}
                      sx={{height: '90%', width: '90%', maxHeight: '200px', maxWidth: '200px'}}
                    />
                  }
                </Box>
                <Button variant='outlined' component='label' sx={{height: '50px'}}>
                  <UploadIcon sx={{mr: '10px'}}/>
                  Upload Image
                  <input
                    id='contained-button-file'
                    ref={ref}
                    name='picture'
                    type='file'
                    accept='image/*'
                    hidden
                    onChange={(event) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.readyState === 2) {
                          const FIVE_MB = 5 * (1024 ** 2)
                          if (event.target.files[0].size < FIVE_MB ) {
                            setFileTooLarge(false)
                            setFieldValue('picture', {name: event.target.files[0].name, file: reader.result.split(',')[1]});
                            setPreview({picture: reader.result});
                          } else {
                            setFileTooLarge(true)
                          }
                        }
                      }
                      if(event.target.files[0]) {
                        reader.readAsDataURL(event.target.files[0])
                      }
                  }} />
                </Button>
              </Stack>
              {errors.picture && touched.picture ? <Typography sx={{color: 'red'}}>{errors.picture}</Typography> : null}
              {isFileTooLarge ? 
                <Typography sx={{fontSize: '12px', color: 'red'}}>The image you selected is larger than 5MB</Typography> :
                formik.values.picture === null ? 
                  <Typography sx={{fontSize: '12px'}}>Image file must be less than 5MB</Typography> :
                  <Typography sx={{fontSize: '12px', color: 'green'}}>Image uploaded</Typography>
              }
            </Stack>

            <Stack direction='row' sx={{justifyContent: 'flex-end'}}>
              <LoadingButton
                sx={{...buttonStyle, color: 'white'}}
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={!formik.dirty || complete}
              >
                Save
              </LoadingButton>
              <Button
                sx={buttonStyle}
                disabled={complete}
                color="error"
                variant="outlined"
                onClick={() => {
                  setPreview(null);
                  ref.current.value = '';
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </Stack>
            {error &&
              <Typography sx={{color: 'red', m: '10px', float: 'right'}}>An error occurred when trying to post your product.</Typography>
            }
          </Form>
        </FormikProvider>
      </Box>
    </RootStyle>
  )
}
