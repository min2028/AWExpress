import { useEffect, useState } from 'react';
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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    useForkRef,
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
import { Container } from '@mui/system';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const textFieldErrorTextStyle = {
    fontSize: '12px',
    color: 'orange',
};

const CATEGORY_OPTION = {
    "All": null,
    "Electronics": 0,
    "Clothing" : 1,
    "Home and Kitchen": 2,
    "Toys": 3,
    "Books": 4,
    "Supplements": 5,
    "Drugs": 6,
    "Drinks and Food": 7,
    "Pets Good": 8,
    "Others": 9,
}

const drawerWidth = '100%';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function PersistentDrawerTop(props) {
    const theme = useTheme();
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const [resetForm, setResetForm] = useState(false)

    const [open, setOpen] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const formik = useFormik({
        initialValues: {
            productName: '',
            productId: '',
            description: '',
            sellerFirstName: '',
            sellerLastName: '',
            sellerDepartment: '',
            sellerId: '',
            category: '',
            lowPrice: '',
            highPrice: '',
            quantity: '',
        },
        validationSchema: Yup.object({
            productId: Yup.string().matches(/^\d*$/, 'ID should be a number'),
            sellerId: Yup.string().matches(/^\d*$/, 'ID should be a number'),
            lowPrice: Yup.string().matches(/^\d*$/, 'Price should be a number'),
            highPrice: Yup.string().matches(/^\d*$/, 'Price should be a number'),
            quantity: Yup.string().matches(/^\d*$/, 'Quantity should be a number'),
        })
    })

    return (
        <>
            <Backdrop
                sx={{
                    zIndex: 1,
                }}
                open={props.open}
                onClick={props.handleSearchDrawer}
            ></Backdrop>
            <Box sx={{ display: 'flex', position: 'fixed', zIndex: 10 }}>
                <CssBaseline />
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                    variant='persistent'
                    anchor='top'
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
                    <Container
                        maxWidth='md'
                        sx={{
                            gap: '30px'

                        }}
                    >
                        <Typography
                            sx={{fontSize: '40px'}}
                        >
                            Advanced Search
                        </Typography>
                        <Typography
                            sx={{fontSize: '16px'}}
                        >
                            Find products that match all specifications below {'(fields can be left blank)'}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginY: '10px'
                            }}
                        >
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.productName}
                                label='Product Name'
                                sx={{
                                    width: '600px'
                                }}
                                name='productName'
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, productName: event.target.value})
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                            <Box>
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.productId}
                                    label='Product ID'
                                    name='productId'
                                    sx={{
                                        width: '150px'
                                    }}
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, productId: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.productId ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.productId}</Typography> : null}
                            </Box>
                        </Box>
                        <TextField
                            defaultValue=''
                            value={resetForm === true ? '' : props.advancedSearchParameters.description}
                            label='Product Description'
                            multiline
                            rows={2}
                            sx={{
                                width: '100%',
                                marginY: '10px',
                            }}
                            onChange={(event) => {
                                props.setAdvancedSearchParameters({...props.advancedSearchParameters, description: event.target.value})
                            }}
                            onKeyDown={(event) => {
                                if(event.key === 'Enter') {
                                    props.advancedSearch()
                                    props.handleSearchDrawer(false)
                                }
                            }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginY: '10px'
                            }}
                        >
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.sellerFirstName}
                                label='Seller Name'
                                sx={{
                                    width: '200px',
                                    [theme.breakpoints.down('advancedSearchDiplay')]: {
                                        width: '100%'
                                    }
                                }}
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerFirstName: event.target.value})
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.sellerLastName}
                                label='Seller Last Name'
                                sx={{
                                    width: '200px',
                                    [theme.breakpoints.down('advancedSearchDiplay')]: {
                                        width: '100%'
                                    }
                                }}
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerLastName: event.target.value})
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                            <Box>
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.sellerId}
                                    label='Seller ID'
                                    name='sellerId'
                                    sx={{
                                        width: '100px',
                                        marginRight: '100px',
                                        [theme.breakpoints.down('advancedSearchDiplay')]: {
                                            display: 'none'
                                        }
                                    }}
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerId: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.sellerId ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.sellerId}</Typography> : null}
                            </Box>
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.sellerDepartment}
                                label='Department'
                                sx={{
                                    width: '200px',
                                    [theme.breakpoints.down('advancedSearchDiplay')]: {
                                        display: 'none'
                                    }
                                }}
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerDepartment: event.target.value})
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'left',
                                marginY: '10px',
                                [theme.breakpoints.up('advancedSearchDiplay')]: {
                                    display: 'none'
                                }
                            }}
                        >
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.sellerId}
                                label='Seller ID'
                                name='sellerId'
                                sx={{
                                    width: '200px',
                                    marginRight: '100px',
                                }}
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerId: event.target.value})
                                    formik.handleChange(event)
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                            {formik.errors.sellerId ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.sellerId}</Typography> : null}
                            <TextField
                                defaultValue=''
                                value={resetForm === true ? '' : props.advancedSearchParameters.sellerDepartment}
                                label='Department'
                                sx={{
                                    width: '100%',
                                }}
                                onChange={(event) => {
                                    props.setAdvancedSearchParameters({...props.advancedSearchParameters, sellerDepartment: event.target.value})
                                }}
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter') {
                                        props.advancedSearch()
                                        props.handleSearchDrawer(false)
                                    }
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                marginY: '10px',
                                [theme.breakpoints.up('advancedSearchDiplay')]: {
                                    display: 'none'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: '200px',
                                    marginRight: '10px'
                                }}
                            >
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.lowPrice}
                                    label='Minimum Price'
                                    name='lowPrice'
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, lowPrice: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.lowPrice ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.lowPrice}</Typography> : null}
                            </Box>
                            <Box
                                sx={{
                                    width: '200px',
                                    marginLeft: '10px'
                                }}
                            >
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.highPrice}
                                    label='Maximum Price'
                                    name='highPrice'
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, highPrice: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.highPrice ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.highPrice}</Typography> : null}
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginY: '20px',
                                [theme.breakpoints.down('advancedSearchDiplay')]: {
                                    justifyContent: 'left'
                                }
                            }}
                        >
                            <FormControl>
                                <InputLabel id='categoryLabel'>Category</InputLabel>
                                <Select
                                    labelId='categoryLabel'
                                    id='category-label'
                                    defaultValue='All'
                                    label='Category'
                                    sx={{
                                        width: '190px'
                                    }}
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, categoryId: CATEGORY_OPTION[event.target.value]})
                                    }}
                                >
                                    {Object.keys(CATEGORY_OPTION).map((value, index) => {
                                        return <MenuItem key={index} value={value}>{value}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>
                            <Box
                                sx={{
                                    width: '140px',
                                    marginLeft: 'auto',
                                    marginRight: '10px',
                                    [theme.breakpoints.down('advancedSearchDiplay')]: {
                                        display: 'none'
                                    }
                                }}
                            >
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.lowPrice}
                                    label='Minimum Price'
                                    name='lowPrice'
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, lowPrice: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.lowPrice ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.lowPrice}</Typography> : null}
                            </Box>
                            <Box
                                sx={{
                                    width: '140px',
                                    marginRight: 'auto',
                                    marginLeft: '10px',
                                    [theme.breakpoints.down('advancedSearchDiplay')]: {
                                        display: 'none'
                                    }
                                }}
                            >
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.highPrice}
                                    label='Maximum Price'
                                    name='highPrice'
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, highPrice: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.highPrice ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.highPrice}</Typography> : null}
                            </Box>
                            <Box
                                sx={{
                                    marginLeft: '10px'
                                }}
                            >
                                <TextField
                                    defaultValue=''
                                    value={resetForm === true ? '' : props.advancedSearchParameters.quantity}
                                    label='Available'
                                    name='quantity'
                                    sx={{
                                        width: '140px',
                                    }}
                                    onChange={(event) => {
                                        props.setAdvancedSearchParameters({...props.advancedSearchParameters, quantity: event.target.value})
                                        formik.handleChange(event)
                                    }}
                                    onKeyDown={(event) => {
                                        if(event.key === 'Enter') {
                                            props.advancedSearch()
                                            props.handleSearchDrawer(false)
                                        }
                                    }}
                                />
                                {formik.errors.quantity ? <Typography sx={textFieldErrorTextStyle}>{formik.errors.quantity}</Typography> : null}
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginY: '15px',
                            }}
                        >
                            <Button variant='contained'
                                    sx={{
                                      bgcolor: theme.palette.secondary.main,
                                      color: theme.palette.secondary.contrastText,
                                      '&:hover': {
                                        bgcolor: theme.palette.secondary.light
                                      }
                                    }}
                                onClick={() => {
                                    props.advancedSearch()
                                    props.handleSearchDrawer(false)
                                }}
                            >
                                Search
                            </Button>
                            <Button variant='outlined'
                                    sx={{
                                      color: theme.palette.secondary.main,
                                      borderColor: theme.palette.secondary.main,
                                      '&:hover': {
                                        backgroundColor: '#f0f0f0',
                                        borderColor: theme.palette.secondary.main
                                      }
                                    }}
                                onClick={() => {
                                    props.setAdvancedSearchParameters({
                                        productName: '',
                                        productId: '',
                                        description: '',
                                        categoryId: '',
                                        sellerFirstName: '',
                                        sellerLastName: '',
                                        sellerDepartment: '',
                                        sellerId: '',
                                        lowPrice: '',
                                        highPrice: '',
                                        quantity: '',
                                    })
                                    setResetForm(true)
                                    setResetForm(false)
                                    formik.resetForm()
                                }}
                            >
                                Clear Form
                            </Button>
                        </Box>
                    </Container>
                    

                    
                </Drawer>
            </Box>
        </>
    );
}
