import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
    Box,
    Drawer,
    CssBaseline,
    List,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Badge,
    Backdrop,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import SellIcon from '@mui/icons-material/Sell';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 200;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft(props) {
    const theme = useTheme();
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const amounts = useSelector(state => state.amounts);

    const [open, setOpen] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Backdrop
                sx={{
                    zIndex: 1,
                }}
                open={props.open}
                onClick={props.handleDrawer}
            />
            <Box 
                sx={{ 
                    display: 'flex', 
                    position: 'fixed', 
                    zIndex: 100, 
                }}
            >
                <CssBaseline />
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            [theme.breakpoints.down('sideDrawerFullWidth')]: {
                                width: '100%',
                            },
                        },
                    }}
                    variant='persistent'
                    anchor='left'
                    open={props.open}
                >
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'ltr' ? (
                                <ChevronLeftIcon />
                            ) : (
                                <ChevronRightIcon />
                            )}
                        </IconButton>
                    </DrawerHeader>
                    <Box sx={{
                        height: '60px', 
                        [theme.breakpoints.up('navBarSearch')]: {display: 'none'}}}
                    ></Box>
                    <Divider />
                    <List>
                        {[
                            'Home',
                            'Order History',
                            `Your Listings (${amounts.listingItems})`,
                            'Order Requests',
                            'Sell an Item',
                        ].map((text, index) => (
                            <Link
                                key={index}
                                href={[
                                    '/home',
                                    '/order_history',
                                    '/listings',
                                    '/pending_orders',
                                    '/sell',
                                ].at(index)}
                                onClick={props.handleDrawer}
                            >
                                <ListItem key={text} disablePadding
                                    sx={{
                                        [theme.breakpoints.down('sideDrawerFullWidth')]: {
                                            height: '100px',
                                        },
                                    }}
                                >
                                    <ListItemButton>
                                        <ListItemIcon
                                            sx={{ 
                                                minWidth: '0px', 
                                                mr: '20px',
                                            }}
                                        >
                                            {[
                                                <HomeIcon key={index} />,
                                                <ShoppingBagIcon key={index} />,
                                                <StorefrontIcon key={index} />,
                                                <Badge
                                                    key={index}
                                                    badgeContent={
                                                        amounts.pendingItems
                                                    }
                                                    color='error'
                                                >
                                                    <AssignmentLateIcon
                                                        key={index}
                                                    />
                                                </Badge>,
                                                <SellIcon key={index} />,
                                            ].at(index)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            color={theme.palette.secondary.main}
                                            primaryTypographyProps={{
                                                sx: {
                                                    [theme.breakpoints.down('sideDrawerFullWidth')]: {
                                                        fontSize: '30px',
                                                    },
                                                }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                    <Box sx={{ flexGrow: 1 }} />

                    {user?.userType && user.userType === 'admin' && (
                        <Box marginBottom='15%'>
                            <Divider>
                                <Typography color='grey'> Admin </Typography>
                            </Divider>

                            <List>
                                {['Manage Users'].map((text, index) => (
                                    <Link
                                        key={index}
                                        href={['/admin'].at(index)}
                                        onClick={props.handleDrawer}
                                    >
                                        <ListItem key={text} disablePadding>
                                            <ListItemButton>
                                                <ListItemIcon
                                                    sx={{
                                                        minWidth: '0px',
                                                        mr: '20px',
                                                    }}
                                                >
                                                    {[
                                                        <AdminPanelSettingsIcon
                                                            key={index}
                                                        />,
                                                    ].at(index)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={text}
                                                    color={
                                                        theme.palette.secondary
                                                            .main
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </Link>
                                ))}
                            </List>
                        </Box>
                    )}
                </Drawer>
            </Box>
        </>
    );
}
