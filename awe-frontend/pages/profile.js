import NavbarLayout from '../layouts/Navbar'
import { Button, Box, Container, List, ListItem, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSession } from "next-auth/react";
import PersonalProfileForm from "../components/forms/PersonalProfileForm";
import BackButton from "../components/utilities/BackButton";
import DepositInfoForm from "../components/forms/DepositInfoForm";
import Head from "next/head";

export default function Profile() {
  const theme = useTheme();
    const {data: session, status} = useSession();

    if (typeof window === "undefined") return null


    if (session) {
        return (
          <Container>
            <Head>
              <title>AWExpress - Profile</title>
              <meta name="profile"/>
              <link rel="icon" href="/favicon.ico?v=2"/>
            </Head>
            <Box sx={{width: '80%', ml: 'auto', mr: 'auto'}}>
              <BackButton />
                <Typography sx={{fontSize: '3rem'}}>Your Account</Typography>
              <Box sx={{backgroundColor:'#f3f3f3', borderRadius: '4px'}}>
                <List>
                    <PersonalProfileForm id_token={session.id_token} />

                    <Divider />

                    <DepositInfoForm id_token={session.id_token} />

                </List>
              </Box>
            </Box>
          </Container>
        )
    } else {
        return <></>
    }
}

Profile.getLayout = (page) => {
    return ( 
      <NavbarLayout>
        {page}
      </NavbarLayout>
    )
}

// export async function getServerSideProps(context) {
//     return {
//         props: {
//             session: await getServerSession(
//               context.req,
//               context.res,
//               authOptions
//             )
//         }
//     }
// }