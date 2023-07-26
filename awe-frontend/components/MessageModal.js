import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Select, MenuItem, IconButton } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import {updateAllAmounts} from '../actions/amounts';
import { useRouter } from 'next/router';
import { useTheme } from '@emotion/react';

export default function MessageModal(props) {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    [theme.breakpoints.down('messageModalSmall')]: {
      width: '100%',
      }   
  };

  return (
    <Modal
        open={props.open}
        onClose={() => {props.setOpen(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <IconButton
                sx={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                }}
                onClick={() => {props.setOpen(false)}}
            >
                <CloseIcon/>
            </IconButton>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                }}
            >
                <Typography sx={{fontSize: '48px'}}>{props.subject}</Typography>
                <Typography sx={{fontSize: '24px', marginY: '20px'}}>{props.message}</Typography>
                <Button variant='text' onClick={() => {props.setOpen(false)}}
                    sx={{
                        position: 'absolute',
                        right: '20px',
                        bottom: '10px',
                    }}
                >
                    Close
                </Button>
            </Box>
            
        </Box>
    </Modal>
  );
}