import * as Yup from 'yup';
import {styled, useTheme} from "@mui/material/styles";
import axios from "axios";
import {useFormik, Form, FormikProvider} from 'formik';
import {Box, Button, Divider, Stack, TextField, Typography, MenuItem, IconButton} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import EditIcon from '@mui/icons-material/Edit'
import {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {useRouter} from "next/router";
import Loader from "../../components/utilities/loader"


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

export default function DepositInfoForm(props) {
  const router = useRouter()
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [initialValues, setInitialValues] = useState({
    institutionNumber: '',
    transitNumber: '',
    accountNumber: '',
  })

  useEffect(() => {
    setLoading(true);
    axios.get(
      `/api/user/${user.userId}/deposit`,
      {headers: {'Content-Type': 'application/json', 'authorization': props.id_token}}
    ).then((response) => {
      setInitialValues({
        institutionNumber: response.data.deposit ? response.data.deposit.institutionNumber ?? '' : '',
        transitNumber: response.data.deposit ? response.data.deposit.transitNumber ?? '' : '',
        accountNumber: response.data.deposit ? response.data.deposit.accountNumber ?? '' : '',
      });
      setLoading(false);
    }).catch((err) => {
      console.log(`Error in getting user deposit info with error ${JSON.stringify(err.response)}`);
      setLoading(false);
    })
  }, []);


  const DepositInfoFormSchema = Yup.object().shape({
    institutionNumber: Yup.string().required('Institution Number is required')
      .min(3, 'Institution number should be at least 3 digits')
      .matches(/^\d+$/, "Instituion number can only contain numbers"),
    transitNumber: Yup.string().required('Transit Number is required')
      .min(5, 'Transit number should be at least 5 digits')
      .matches(/^\d+$/, "Transit number can only contain numbers"),
    accountNumber: Yup.string().required('Account Number is required')
      .min(7, 'Account number should be at least 7 digits')
      .matches(/^\d+$/, "Account number can only contain numbers"),
  });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: DepositInfoFormSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      const remainingValues = Object.assign({}, values);
      // // remove blank or unchanged values
      // Object.keys(remainingValues).forEach(key => {
      //   if (remainingValues[key] === '' || remainingValues[key] === initialValues[`${key}`]) delete remainingValues[key];
      // })

      return axios.patch(
        `/api/user/${user.userId}/deposit`,
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
    resetForm,
    setFieldValue
  } = formik;

  return (
    <RootStyle>
      <Box sx={{width: '100%', borderRadius: 1, p: 3}}>
        <Stack direction="row">
          <Typography variant="h4" gutterBottom>
            Deposit Info
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
              <Divider sx={{marginBottom: 2, marginRight: 2, marginLeft: 2}}/>
              <Stack spacing={3} sx={sectionStyle}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="Institution Number"
                    inputProps={{maxLength: 3}}
                    {...getFieldProps('institutionNumber')}
                    error={Boolean(touched.institutionNumber && errors.institutionNumber)}
                    helperText={touched.institutionNumber && errors.institutionNumber}
                    onChange={(event) => {
                      event.preventDefault();
                      const {value} = event.target;
                      const regex = /^\d*$/;
                      if (regex.test(value.toString())) setFieldValue("institutionNumber", value);
                    }}
                  />
                  <TextField
                    disabled={!editing}
                    variant={editing ? 'outlined' : 'standard'}
                    sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                    fullWidth
                    label="TransitNumber"
                    inputProps={{maxLength: 5}}
                    {...getFieldProps('transitNumber')}
                    error={Boolean(touched.transitNumber && errors.transitNumber)}
                    helperText={touched.transitNumber && errors.transitNumber}
                    onChange={(event) => {
                      event.preventDefault();
                      const {value} = event.target;
                      const regex = /^\d*$/;
                      if (regex.test(value.toString())) setFieldValue("transitNumber", value);
                    }}
                  />
                </Stack>
                <TextField
                  disabled={!editing}
                  variant={editing ? 'outlined' : 'standard'}
                  sx={{...inputTextStyle, '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black'}}}
                  fullWidth
                  label="Account Number"
                  inputProps={{maxLength: 12}}
                  {...getFieldProps('accountNumber')}
                  error={Boolean(touched.accountNumber && errors.accountNumber)}
                  helperText={touched.accountNumber && errors.accountNumber}
                  onChange={(event) => {
                    event.preventDefault();
                    const {value} = event.target;
                    const regex = /^\d*$/;
                    if (regex.test(value.toString())) setFieldValue("accountNumber", value);
                  }}
                />
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
