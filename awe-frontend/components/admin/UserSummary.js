import {
  Avatar,
  Button, Dialog,
  DialogActions, DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {useSelector} from "react-redux";
import {useSession} from "next-auth/react";
import {useState} from "react";
import axios from "axios";
import Loader from "../utilities/loader";
import {useTheme} from "@mui/material/styles";


const fakeUser = {
  userId: "54",
  userType: "user",
  department: "Accounting",
  firstname: "Bob",
  lastname: "Faker",
  email: "bob_faker@gmail.com"
}

const buttonStyle = {
  color: "white",
  backgroundColor: "grey",
  borderRadius: "5px",
  width: "30px",
  height: "30px",
  "&:hover": {backgroundColor: "grey"}
}


export default function UserSummary(props) {
  const theme = useTheme();
  const { user, setError, setErrorMessage, setUser, samePerson } = props;
  const userId = useSelector(state => state.auth.user.userId);
  const {data: session, status} = useSession();

  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const promote = () => {
    setLoading(true);
    return axios.post(
      `/api/admin/${userId}/promote`,
      {email: user.userEmail},
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setUser({...user, userType: 'admin'});
        setLoading(false);
      }
    }).catch((err) => {
      setLoading(false);
      setErrorMessage(`Something went wrong when promoting user: ${JSON.stringify(err.response.data)}`);
      setError(true);
    })
  }

  const demote = () => {
    setLoading(true);
    return axios.post(
      `/api/admin/${userId}/demote`,
      {email: user.userEmail},
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setUser({...user, userType: 'user'});
        setLoading(false);
      }
    }).catch((err) => {
      setLoading(false);
      setErrorMessage(`Something went wrong when demoting user: ${JSON.stringify(err.response.data)}`);
      setError(true);
    })
  }

  const remove = () => {
    setLoading(true);
    return axios.post(
      `/api/admin/${userId}/delete`,
      {email: user.userEmail},
      {headers: {'Content-Type': 'application/json', 'authorization': session.id_token}}
    ).then((response) => {
      if (response.status === 200) {
        setUser(null);
        setLoading(false);
      }
    }).catch((err) => {
      setLoading(false);
      setErrorMessage(`Something went wrong when trying to delete user: ${JSON.stringify(err.response.data)}`);
      setError(true);
    })
  }

  const getAvatar = () => {
    if (user.firstname || user.lastname) {
      return user.firstname?.charAt(0) + user.lastname?.charAt(0);
    } else {
      return user.userEmail.charAt(0) + user.userEmail.charAt(1);
    }
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  }

  return (
    <Stack direction="row" spacing={3} sx={{alignItems: "center", backgroundColor: 'white', borderRadius: '3px', p: '5px'}}>
      <Avatar sx={{ width: 50, height: 50, bgcolor: theme.palette.primary.main}}> {getAvatar()} </Avatar>
      <Stack direction="column">
        <Typography variant="h6">{user.firstname ?? ''} {user.lastname ?? ''}</Typography>
        <Typography>{user.userEmail}</Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack direction="column">
        <Typography variant="h6" sx={{color: 'grey'}}>Department:</Typography>
        <Typography>{user.department ?? ''}</Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack direction="column">
        <Typography variant="h6" sx={{color: 'grey'}}>User Type:</Typography>
        <Typography>{user.userType}</Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack spacing={1} direction="row" sx={{alignItems: "center"}}>
        <Tooltip title="Promote to Admin">
          <IconButton
            disabled={user.userType !== "user" || samePerson}
            onClick={promote}
            sx={{...buttonStyle, backgroundColor: "green"}}>
            <UpgradeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Demote from Admin">
          <IconButton
            disabled={user.userType !== "admin" || samePerson}
            onClick={demote}
            sx={{...buttonStyle, backgroundColor: "orange"}}>
            <VerticalAlignBottomIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete User">
          <IconButton
            disabled={samePerson}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{...buttonStyle, backgroundColor: "red"}}>
            <DeleteForeverIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Are you sure you want to delete this user?
        </DialogTitle>
        <DialogContent>
          (You will remove all their listings and orders)
        </DialogContent>
        <DialogActions>
          <Button
            disabled={loading}
            variant='contained'
            sx={{backgroundColor: 'red', color: 'white'}}
            onClick={remove}
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
          <Button sx={{color: theme.palette.secondary.main}} onClick={closeDeleteDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  )

}