import * as Yup from 'yup';
import {styled, useTheme} from "@mui/material/styles";
import axios from "axios";
import {useFormik, Form, FormikProvider} from 'formik';
import {Box, Button, Divider, Stack, TextField, Typography, IconButton} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import RefreshIcon from '@mui/icons-material/Refresh';
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from 'react-redux';
import NavbarLayout from "../layouts/Navbar";
import {useRouter} from "next/router";


const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    display: 'flex',
    justifyContent: 'center',
    width: "80%",
    marginLeft: 'auto',
    marginRight: 'auto',
  },


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

const fakeOrg = {
  name: 'fakeOrg',
  website_url: 'http://fakeOrg.com',
  email: 'fakeOrg@hotmail.com',
  phone: '123-4567',
  street_number: '1234',
  street: 'Fake Street',
  city: 'Vancouver',
  postal: 'A1B2C3',
  state: 'British Columbia',
  country: 'Canada',
}

function generateJoinID() {
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  length = 6
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function EditOrganization() {
  const router = useRouter()
  const theme = useTheme();
  const [initialValues, setInitialValues] = useState({
    name: '',
    website_url: '',
    email: '',
    phone: '',
    street_number: '',
    street: '',
    city: '',
    postal: '',
    state: '',
    country: '',
    join_id: '',
  })

  // useEffect(() => {
  //   axios.get(`/api/organizations/${selectedOrgUUID}`).then((response) => {
  //     const organization = response.data
  //     setInitialValues({
  //       name: organization.name ?? '',
  //       website_url: organization.website_url ?? '',
  //       email: organization.email ?? '',
  //       phone: organization.phone ?? '',
  //       street_number: organization.street_number ?? '',
  //       street: organization.street ?? '',
  //       city: organization.city ?? '',
  //       postal: organization.postal ?? '',
  //       state: organization.state ?? '',
  //       country: organization.country ?? '',
  //       join_id: organization.join_id ?? ''});
  //   }).catch((err) => {
  //     setAlertState({open: true, message: err.response.data.error, severity: 'error'})
  //   })
  // }, [selectedOrgUUID]);


  const EditOrganizationSchema = Yup.object().shape({
    name: Yup.string().max(50, 'Name must be less than 50 characters').required('Name is required'),
    website_url: Yup.string().url('Must be a valid URL').max(200, 'URL is too long'),
    email: Yup.string().email('Must be a valid email address').max(254, 'Too long!'),
    phone: Yup.string().max(20, 'Too long!'),
    street_number: Yup.string().max(12, 'Too long!'),
    street: Yup.string().max(20, 'Too long!'),
    city: Yup.string().max(20, 'Too long!'),
    postal: Yup.string().max(10, 'Too long!'),
    state: Yup.string().max(20, 'Too long!'),
    country: Yup.string().max(20, 'Too long!'),
    join_id: Yup.string().max(6, 'Too long!')
  });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: EditOrganizationSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      const remainingValues = Object.assign({}, values);
      Object.keys(remainingValues).forEach(key => {
        if (remainingValues[key] === '' || remainingValues[key] === initialValues[`${key}`]) delete remainingValues[key];
      })

      // return axios.patch(`/api/organizations/${selectedOrgUUID}`, remainingValues)
      //   .then((response) => {
      //     if (response.status === 200) {
      //       setInitialValues(values);
      //     }
      //   }).catch((err) => {
      //     setAlertState({
      //       open: true,
      //       message: `${err.response.data.error}`,
      //       severity: 'error'
      //     })
      //   })
    }
  });

  const {errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue} = formik;

  return (
    <RootStyle title="Edit Organization">
      <Box sx={{width: '100%', backgroundColor: 'background.paper', borderRadius: 1, p: 3}}>
        <Typography variant="h4" gutterBottom>
          Edit Your Organization
        </Typography>
        <Typography sx={{color: 'text.secondary', marginBottom: 8}}>Enter organization details
          below.</Typography>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>

            <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}>
              <Typography variant='subtitle1' sx={{color: 'text.secondary'}}>General</Typography>
            </Divider>
            <Stack spacing={3} sx={sectionStyle}>
              <TextField
                sx={inputTextStyle}
                fullWidth
                label="Name"
                {...getFieldProps('name')}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
              />
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Email"
                  {...getFieldProps('email')}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Phone"
                  {...getFieldProps('phone')}
                  error={Boolean(touched.phone && errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Stack>
              <TextField
                sx={inputTextStyle}
                fullWidth
                label="Website URL"
                {...getFieldProps('website_url')}
                error={Boolean(touched.website_url && errors.website_url)}
                helperText={touched.website_url && errors.website_url}
              />
            </Stack>


            <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}>
              <Typography variant='subtitle1' sx={{color: 'text.secondary'}}>Address</Typography>
            </Divider>
            <Stack spacing={3} sx={sectionStyle}>
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Street #"
                  {...getFieldProps('street_number')}
                  error={Boolean(touched.street_number && errors.street_number)}
                  helperText={touched.street_number && errors.street_number}
                />
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Street"
                  {...getFieldProps('street')}
                  error={Boolean(touched.street && errors.street)}
                  helperText={touched.street && errors.street}
                />
              </Stack>
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="City"
                  {...getFieldProps('city')}
                  error={Boolean(touched.city && errors.city)}
                  helperText={touched.city && errors.city}
                />
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="State / Province"
                  {...getFieldProps('state')}
                  error={Boolean(touched.state && errors.state)}
                  helperText={touched.state && errors.state}
                />
              </Stack>
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Zip / Postal"
                  {...getFieldProps('postal')}
                  error={Boolean(touched.postal && errors.postal)}
                  helperText={touched.postal && errors.postal}
                />
                <TextField
                  sx={inputTextStyle}
                  fullWidth
                  label="Country"
                  {...getFieldProps('country')}
                  error={Boolean(touched.country && errors.country)}
                  helperText={touched.country && errors.country}
                />
              </Stack>
            </Stack>
            <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}>
            </Divider>
            <Stack direction='column' sx={{marginLeft: 2, alignContent: 'center'}}>
              <Stack direction='row' spacing={2} sx={{marginTop: 2, alignItems: 'center'}}>
                <p> Organization ID / Join ID: </p>
                <TextField
                  disabled
                  size='small'
                  sx={inputTextStyle}
                  {...getFieldProps('join_id')}
                  error={Boolean(touched.joinID && errors.joinID)}
                  helperText={touched.joinID && errors.joinID}
                />
                <IconButton onClick={() => setFieldValue('join_id', generateJoinID())}>
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Stack>

            <LoadingButton
              sx={buttonStyle}
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!formik.dirty}
            >
              Save
            </LoadingButton>
          </Form>
        </FormikProvider>
      </Box>
    </RootStyle>
  )
}

// export async function getServerSideProps(context) {
//     // Get external data from API
//     const cookies = cookie.parse(context.req.headers.cookie ?? '');
//     const access = cookies.access ?? false;
//     const uuid = context.params.uuid;
//
//     try {
//         const response = await axios.get(`${API_URL}/organizations/${uuid}/`, {headers: {'Authorization': `Bearer ${access}`}})
//         return {props: {organization: response.data}}
//     } catch(err) {
//         return {props: {organization: null}}}
//     }

EditOrganization.getLayout = (page) => {
  return (
    <NavbarLayout>
      {page}
    </NavbarLayout>
  )
}