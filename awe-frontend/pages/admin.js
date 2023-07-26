import NavbarLayout from '../layouts/Navbar';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Avatar,
  Tooltip,
  InputAdornment, IconButton, OutlinedInput, InputLabel, Stack, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Loader from "../components/utilities/loader";
import BackButton from "../components/utilities/BackButton";
import UserSummary from "../components/admin/UserSummary";
import UserOrders from "../components/admin/UserOrders"
import axios from "axios";
import {useSession} from "next-auth/react";
import {useSelector} from "react-redux";
import {useRouter} from "next/router";
import Head from "next/head";

const fakeUser = {
  userId: '123',
  firstname: 'Bob',
  lastname: 'Faker',
  userEmail: 'bob_faker@gmail.com',
  department: 'accounting',
  userType: 'user',
}


export default function Admin() {
    const theme = useTheme();
    const router = useRouter();
    const {data: session, status} = useSession();

    const [email, setEmail] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [samePerson, setSamePerson] = useState(false);

    const user = useSelector(state => state.auth.user);

    useEffect(() => {
      if (user.userType !== 'admin') {
        router.replace('/home');
      }
    }, [])

    const onEnter = (event) => {
      if (event.key === "Enter") {
        submit();
        event.preventDefault();
      }
    }

    const submit = () => {
      setLoading(true);
      setUserData(null);
      setError(false);
      return axios.post(
        '/api/user/searchbyemail/',
        {email: email},
        {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
      ).then((response) => {
        if (response.status === 200) {
          setUserData(response.data);
          setSamePerson(response.data.userId === user.userId);
          setLoading(false);
        }
      }).catch((err) => {
        setLoading(false);
        setErrorMessage('Could not find user');
        setError(true);
      })
    }

    /*
    {"userEmail":"tyranos.wl@gmail.com","userType":"user","userId":2003,"firstname":"Ryan","lastname":"Tso","address":{"street":"123 Easy St.","province":"British Columbia"},"payment":null,"deposit":null,"sellerVerified":null,"department":"Accounting"}
     */

    return (
      <Container>
        <Head>
          <title>AWExpress - Admin</title>
          <meta name="admin"/>
          <link rel="icon" href="/favicon.ico?v=2"/>
        </Head>
        <Box sx={{width: '70%', ml: 'auto', mr: 'auto'}}>
        <BackButton />
        <Typography sx={{fontSize: '3rem'}}>Manage Users</Typography>
        <Typography variant='h6' sx={{mb: '5%'}}>You can promote, demote, or remove users or their active orders</Typography>

            <Typography sx={{fontSize: '1rem', mb: '8px'}}>Search for a user by email:</Typography>
            <TextField
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyPress={onEnter}
              error={error}
              helperText={error && <Typography color='red'>{errorMessage}</Typography>}
              sx={{ width: '100%', backgroundColor:'white'}}
              InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                        {!loading &&
                          <IconButton onClick={submit}>
                              <SearchIcon />
                          </IconButton>
                        }
                        {loading &&
                            <IconButton disabled>
                                <Loader contained={true} size={25} color={theme.palette.secondary.light} />
                            </IconButton>
                        }
                    </InputAdornment>
                  )
              }}
            />
          {userData &&
            <Box sx={{mt: "4%"}}>
              <UserSummary
                user={userData}
                samePerson={samePerson}
                setError={setError}
                setErrorMessage={setErrorMessage}
                setUser={setUserData}/>
              <UserOrders userId={userData.userId} id_token={session.id_token} />
            </Box>
          }
        </Box>
      </Container>
    )
}

Admin.getLayout = (page) => {
    return ( 
      <NavbarLayout>
        {page}
      </NavbarLayout>
    )
  }