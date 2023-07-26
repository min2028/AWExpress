import {Box, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import axios from 'axios';
import {useState} from "react";
import {useSelector} from "react-redux";
import { useRouter } from 'next/router';
import Loader from "../utilities/loader";


export default function RemovePostButton(props) {
  const { productId, id_token } = props;
  const theme = useTheme();
  const router = useRouter();
  const user = useSelector(state => state.auth.user);

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(false)

  const close = () => {
    setOpenDialog(false);
    setLoading(false);
    setComplete(false);
    setError(false);
  }

  const submit = () => {
    setLoading(true);
    return axios.post(
      `/api/admin/${user.userId}/deletepost`,
      {productId: parseInt(productId)},
      {headers: {'Content-Type': 'application/json', 'authorization': id_token}}
      ).then((response) => {
      if (response.status === 200) {
        setLoading(false);
        setError(false);
        setComplete(true);
        setTimeout(() => {
          router.replace('/home')
        }, 2000)

      }
    }).catch((err) => {
      setLoading(false);
      setError(true);
      console.log(JSON.stringify(err.response.data));
    })
  }

  if (user.userType && user.userType === 'admin') {
    return (
      <>
        <Button
          sx={{color: 'red'}}
          onClick={() => {
            setOpenDialog(true)
          }}
        >
          Remove Post
        </Button>
        <Dialog
          open={openDialog}
          onClose={close}
        >
          <DialogTitle>
            Are you sure you want to remove this post?
          </DialogTitle>
          <DialogActions>
            <Button
              disabled={complete || loading}
              variant='contained'
              sx={{backgroundColor: 'red', color: 'white'}}
              onClick={submit}
            >
              {!loading &&
                'Yes'
              }
              {loading &&
                <IconButton disabled>
                  <Loader contained={true} size={25} color={theme.palette.secondary.contrastText}/>
                </IconButton>
              }
            </Button>
            <Button sx={{color: theme.palette.secondary.main}} onClick={close}>
              Cancel
            </Button>
          </DialogActions>
          {error &&
            <DialogContent sx={{color: 'red'}}>
              An error occurred when trying to remove this post
            </DialogContent>
          }
          {complete &&
            <DialogContent sx={{color: 'green'}}>
              Successfully removed this post! Returning to home...
            </DialogContent>
          }

        </Dialog>
      </>
    )
  } else {
    return (
      <></>
    )
  }

}