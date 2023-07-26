import * as Yup from 'yup';
import {styled, useTheme} from "@mui/material/styles";
import axios from "axios";
import {useFormik, Form, FormikProvider} from 'formik';
import {Box, Button, Divider, Stack, TextField, Typography, MenuItem, IconButton, Backdrop} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import EditIcon from '@mui/icons-material/Edit'
import {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {useRouter} from "next/router";
import Loader from "../../components/utilities/loader";

const NAME_REGEX = /^[a-zA-Z ,.'-]*$/;


const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    display: 'flex',
    justifyContent: 'center',
    width: "100%",
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

export default function PersonalProfileForm(props) {
  const router = useRouter()
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true);

  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    street: '',
    city: '',
    postal: '',
    province: '',
  })

  useEffect(() => {
    setLoading(true);
    axios.get(
      `/api/user/${user.userId}`,
      {headers: {'Content-Type': 'application/json', 'authorization': props.id_token}}
    ).then((response) => {
      setInitialValues({
        first_name: response.data["firstname"] ?? '',
        last_name: response.data["lastname"] ?? '',
        email: response.data["userEmail"] ?? '',
        department: response.data.department ?? '',
        street: (response.data.address && response.data.address.street) ? response.data.address.street : '',
        city: (response.data.address && response.data.address.city) ? response.data.address.city : '',
        postal: (response.data.address && response.data.address.postal) ? response.data.address.postal : '',
        province: (response.data.address && response.data.address.province) ? response.data.address.province : '',
      });
      setLoading(false);
    }).catch((err) => {
      console.log(`Error in getting user info with error ${JSON.stringify(err.response)}`);
      setLoading(false);
    })
  }, []);


  const PersonalProfileFormSchema = Yup.object().shape({
    first_name: Yup.string().max(50, 'First name must be less than 50 characters')
      .required('First name is required'),
    last_name: Yup.string().max(50, 'Last name must be less than 50 characters')
      .required('Last name is required'),
    email: Yup.string().email('Must be a valid email address').max(254, 'Too long!'),
    street: Yup.string().max(50, 'Too long!'),
    city: Yup.string().max(30, 'Too long!'),
    postal: Yup.string().max(10, 'Too long!'),
    province: Yup.string().max(22, 'Too long!'),
  });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: PersonalProfileFormSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      const remainingValues = Object.assign({}, values);
      // // remove blank or unchanged values
      // Object.keys(remainingValues).forEach(key => {
      //   if (remainingValues[key] === '' || remainingValues[key] === initialValues[`${key}`]) delete remainingValues[key];
      // })

      return axios.patch(
        `/api/user/${user.userId}`,
        remainingValues,
        {headers: {'Content-Type': 'application/json', 'authorization': props.id_token}}
        ).then((response) => {
          if (response.status === 200) {
            setInitialValues(values);
            setEditing(false);
          }
        }).catch((err) => {
          console.log(`Error in updating user info with error ${JSON.stringify(err.response.data)}`);
        })
    }
  });

  const {
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    setFieldValue,
    resetForm
  } = formik;

  return (
    <RootStyle>
      <Box sx={{width: '100%', borderRadius: 1, p: 3}}>
        <Stack direction="row">
          <Typography variant="h4" gutterBottom>
            Personal Info
          </Typography>
          {!editing &&
            <IconButton
              sx={{ml: "2%", height: "40px", width: "40px"}}
              variant="contained"
              onClick={() => setEditing(true)}
            >
              <EditIcon />
            </IconButton>
          }
        </Stack>
        {loading &&
            <Loader contained size={50} color={theme.palette.secondary.main}/>
        }
        {!loading &&
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>

              <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}>
                <Typography variant='subtitle1' sx={{color: 'text.secondary'}}>General</Typography>
              </Divider>
              <Stack spacing={3} sx={sectionStyle}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="First Name"
                    {...getFieldProps('first_name')}
                    error={Boolean(touched.first_name && errors.first_name)}
                    helperText={touched.first_name && errors.first_name}
                    onChange={(event) => {
                      event.preventDefault();
                      const {value} = event.target;
                      if (NAME_REGEX.test(value.toString())) setFieldValue("first_name", value);
                    }}
                  />
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="Last Name"
                    {...getFieldProps('last_name')}
                    error={Boolean(touched.last_name && errors.last_name)}
                    helperText={touched.last_name && errors.last_name}
                    onChange={(event) => {
                      event.preventDefault();
                      const {value} = event.target;
                      if (NAME_REGEX.test(value.toString())) setFieldValue("last_name", value);
                    }}
                  />
                </Stack>
                <TextField
                  disabled
                  variant='standard'
                  sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                  fullWidth
                  label="Email"
                  {...getFieldProps('email')}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  select
                  disabled={!editing}
                  variant={editing ? 'outlined' : 'standard'}
                  sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                  fullWidth
                  label="Department"
                  {...getFieldProps('department')}
                  error={Boolean(touched.department && errors.department)}
                  helperText={touched.department && errors.department}
                >
                  <MenuItem value="Accounting" label="Accounting"> Accounting </MenuItem>
                  <MenuItem value="Marketing" label="Marketing"> Marketing </MenuItem>
                  <MenuItem value="Sales" label="Sales"> Sales </MenuItem>
                </TextField>
              </Stack>


              <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}>
                <Typography variant='subtitle1' sx={{color: 'text.secondary'}}>Address</Typography>
              </Divider>
              <Stack spacing={3} sx={sectionStyle}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="Street"
                    {...getFieldProps('street')}
                    error={Boolean(touched.street && errors.street)}
                    helperText={touched.street && errors.street}
                  />
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="City"
                    {...getFieldProps('city')}
                    error={Boolean(touched.city && errors.city)}
                    helperText={touched.city && errors.city}
                  />
                </Stack>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="State / Province"
                    {...getFieldProps('province')}
                    error={Boolean(touched.province && errors.province)}
                    helperText={touched.province && errors.province}
                  />
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="Zip / Postal"
                    {...getFieldProps('postal')}
                    error={Boolean(touched.postal && errors.postal)}
                    helperText={touched.postal && errors.postal}
                    onChange={(event) => {
                      event.preventDefault();
                      const {value} = event.target;
                      const regex = /^\w*$/;
                      if (regex.test(value.toString())) setFieldValue("postal", value);
                    }}
                  />
                </Stack>
              </Stack>

              {editing &&
                <Button
                  sx={buttonStyle}
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    resetForm();
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              }
              {editing &&
                <LoadingButton
                  sx={{...buttonStyle, color: 'white'}}
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  disabled={!formik.dirty}
                >
                  Save
                </LoadingButton>
              }

            </Form>
          </FormikProvider>
        }
      </Box>
    </RootStyle>
  )
}