import { useState } from 'react';
import Link from 'next/link';
import {useSession, signIn, signOut} from 'next-auth/react';
import {Box, Avatar, Menu, MenuItem, Divider, IconButton, Tooltip, Typography} from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Storefront from '@mui/icons-material/Storefront';
import {useRouter} from "next/router";
import { useTheme } from '@mui/material/styles';

export default function AccountMenu(props) {
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = () => {
    signOut({callbackURL: '/login'});
  }

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          textAlign: 'center',
        }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
              <Avatar src={props.user.image} sx={{ width: 32, height: 32 }}>{props.user.name.charAt(0)}</Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Link href='/profile'>
          <MenuItem onClick={handleClose}>
            <AccountCircle sx={{color: 'grey'}}/>
            <Typography color={theme.palette.secondary.main}>
              My Account
            </Typography>
          </MenuItem>
        </Link>
        <Link href='/cart'>
          <MenuItem onClick={handleClose}>
            <ShoppingCartIcon sx={{color: 'grey'}}/>
            <Typography color={theme.palette.secondary.main}>
              Shopping Cart
            </Typography>
          </MenuItem>
        </Link>
        <Link href='/order_history'>
          <MenuItem onClick={handleClose}>
            <ShoppingBag sx={{color: 'grey'}}/>
            <Typography color={theme.palette.secondary.main}>
              Your Orders
            </Typography>
          </MenuItem>
        </Link>
        <Link href='/listings'>
          <MenuItem onClick={handleClose}>
            <Storefront sx={{color: 'grey'}}/>
            <Typography color={theme.palette.secondary.main}>
              Listings
            </Typography>
          </MenuItem>
        </Link>
        <Divider />
        <p>
          <MenuItem onClick={logOut}>
            <Logout sx={{color: 'grey'}}/>
            <Typography color={theme.palette.secondary.main}>
              Logout
            </Typography>
          </MenuItem>
        </p>
      </Menu>
    </>
  );
}
