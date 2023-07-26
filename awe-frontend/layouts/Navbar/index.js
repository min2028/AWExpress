import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import AccountMenu from './AccountMenu';
import Drawer from './Drawer';
import Cart from './Cart';
import Advanced from './Advanced'

import {
  Stack,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Button,
  InputAdornment, TextField, MenuItem, Select, Tooltip, Icon
} from "@mui/material";
import { styled, alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {getSession, useSession, signOut, signIn} from "next-auth/react";
import {getServerSession} from 'next-auth/next';
import authOptions from "../../pages/api/auth/[...nextauth]";
import Loader from "../../components/utilities/loader";
import {useDispatch, useSelector} from "react-redux";
import {updateAllAmounts} from "../../actions/amounts";
import axios from "axios";
import {login} from "../../actions/auth";
import { TRIGGER_CART_UPDATE } from "../../actions/types";

const CATEGORY_LIST = {
  0:"All",
  1:"Electronics",
  2:"Clothing",
  3:"Home and Kitchen",
  4:"Toys",
  5:"Books",
  6:"Supplements",
  7:"Drugs",
  8:"Drinks and Food",
  9:"Pets Good",
  10:"Others",
}

const CATEGORY_ID = {
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

const STATUS_LIST = {
  0: 'All',
  1: 'Active',
  2: 'Inactive',
  3: 'Disabled'
}

const STATUS_BY_NAME = {
  "All": null,
  "Active": 1,
  "Inactive": 2,
  "Disabled": 4,
}

const TOOLBAR_HEIGHT = 50
const DRAWER_WIDTH = 200

const MainStyle = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: TOOLBAR_HEIGHT + 20,
  flexGrow: 1,
  overflow: 'auto',
  maxHeight: `calc(100% - ${TOOLBAR_HEIGHT}px - 20px)`,
  width: '100%',
  paddingTop: 50,
  paddingBottom: 50,
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  '@media all': {height: TOOLBAR_HEIGHT},
  backgroundColor: theme.palette.secondary.main,
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  flexGrow: 1,
  backgroundColor: alpha(theme.palette.common.white, 0.60),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.90),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  height: '60%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: `calc(100% - 50px)`,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(1)})`,
    transition: theme.transitions.create('width'),
  },
}));
let shopping_cart_quantity;
export default function NavbarLayout({children}) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const {data: session, status} = useSession();
  const user = useSelector(state => state.auth.user);
  const amounts = useSelector(state => state.amounts);
  const cartQty = amounts.cartItems;
  const orderQty = amounts.orderItems;
  const listingQty = amounts.listingItems;
  const pendingOrderQty = amounts.pendingItem;

  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerOpen, setDrawer] = useState(false);
  const [isCartOpen, setCart] = useState(false);
  const [isSearchDrawerOpen, setSearchDrawer] = useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const [searchBarTextInput, setSearchBarTextInput] = useState('');
  const [categoryMenuInput, setCategoryMenuInput] = useState('All')
  const [statusMenuInput, setStatusMenuInput] = useState("Active")
  // const [cartQty, setCartQty] = useState(0);
  // const [pendingOrderQty, setPendingOrderQty] = useState(0);
  // const [listingQty, setListingQty] = useState(0);

  const [initialCart, setInitialCart] = useState([]);
  const [subTotal, setSubTotal] = useState();

  const [loading, setLoading] = useState(false);

  const [isFirstRender, setIsFirstRender] = useState(true)

  const [advancedSearchParameters, setAdvancedSearchParameters] = useState({
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

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") console.log(`Refresh token is error with error ${JSON.stringify(session.error)}`)
    if (status === 'unauthenticated' || !user) router.replace('/login')
  }, [router.asPath, session, status])

  useEffect(() => {
    if (session && user) {
      dispatch(updateAllAmounts(user.userId, session.id_token));
    }
    if(!router.asPath.includes('categoryId=' + CATEGORY_ID[categoryMenuInput])) {
      setCategoryMenuInput('All')
    }
    if(!router.asPath.includes('status=' + STATUS_BY_NAME[statusMenuInput])) {
      setStatusMenuInput('Active')
    }
  },[router.asPath, session, cartQty])

  useEffect(() => {
    if (session && user) {
        let subTotalCounter = 0;
        if (status === 'authenticated') {
            axios
                .get(`/api/user/${user.userId}/cart/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: session.id_token,
                    },
                })
                .then((response) => {
                    let shopping_cart_items = [];
                    // response.data['items'].map((res_item) => {
                    //     // shopping_cart_items.push({
                    //     //     productId: res_item['productId'],
                    //     //     productName: res_item['productName'],
                    //     //     description: res_item['description'],
                    //     //     price: res_item['price'],
                    //     //     quantity: res_item['quantity'],
                    //     //     picture: res_item['picture'],
                    //     //     availableQuantity: res_item['availableQuantity'],
                    //     // });
                    //     subTotalCounter =
                    //         subTotalCounter +
                    //         res_item['price'] * res_item['quantity'];
                    // });
                    for (const res_item of response.data['items']) {
                      subTotalCounter = subTotalCounter + res_item['price'] * res_item['quantity'];
                    }
                    shopping_cart_quantity = shopping_cart_items.length;
                    setInitialCart(response.data['items']);
                    setSubTotal(subTotalCounter);
                })
                .catch((err) => {
                    console.log(
                        `Error in getting cart info with error ${JSON.stringify(
                            err.response
                        )}`
                    );
                });
        } else {
            setInitialCart([]);
        }
    }
  }, [router.asPath, cartQty, amounts.cartUpdateListener]);

  useEffect(() => {
    if(router.pathname !== '/cart' && router.pathname !== '/payconfirm' && !isFirstRender) {
      setCart(true)
    }
    setIsFirstRender(false)
  }, [cartQty, amounts.cartUpdateListener])

  const search = () => {
      router.push({
        pathname: '/home',
        query: {
          productName: searchBarTextInput,
          categoryId: CATEGORY_ID[categoryMenuInput],
          status: STATUS_BY_NAME[statusMenuInput],
        }
      })
  }

  if (typeof window === "undefined") return null;

  if (session) {
    const handleDrawer = () => {
      setDrawer(!isDrawerOpen)
    }

    const handleCart = () => {
      setCart(!isCartOpen)
    }

    const handleCartChange = (newCart) => {
      setInitialCart(newCart)
      let subTotalCounter = 0
      newCart.forEach(item => {
        subTotalCounter = subTotalCounter + item.price * item.quantity
      });
      setSubTotal(subTotalCounter)
      // setCartQty(newCart.length)
      dispatch(updateAllAmounts(user.userId, session.id_token));
      dispatch({type: TRIGGER_CART_UPDATE})
    }

    const handleSearchDrawer = () => {
      setSearchDrawer(!isSearchDrawerOpen)
    }

    const advancedSearch = () => {
      router.push({
        pathname: '/home',
        query: {
          productName: advancedSearchParameters.productName,
          productId: advancedSearchParameters.productId,
          description: advancedSearchParameters.description,
          categoryId: advancedSearchParameters.categoryId,
          lowPrice: advancedSearchParameters.lowPrice,
          highPrice: advancedSearchParameters.highPrice,
          quantity: advancedSearchParameters.quantity,
          sellerFirstName: advancedSearchParameters.sellerFirstName,
          sellerLastName: advancedSearchParameters.sellerLastName,
          sellerDepartment: advancedSearchParameters.sellerDepartment,
          sellerId: advancedSearchParameters.sellerId,
        }
      })
    }

    return (
      <Box sx={{ flexGrow: 1, top: '0', left: '0', width: '100%', overflow: 'hidden' }}>
        <AppBar position="fixed">
          <ToolbarStyle>
            <IconButton
              size="large"
              edge="start"
              aria-label="open drawer"
              onClick={handleDrawer}
              sx={{ mr: 2, color: theme.palette.secondary.contrastText }}
            >
              {amounts.pendingItems > 0 &&
              <Badge color="error" variant="dot">
                <MenuIcon />
              </Badge>
              }
              {amounts.pendingItems === 0 &&
                <MenuIcon />
              }
            </IconButton>
            <Stack direction="row" onClick={() => router.push("/home")} sx={{mr: 2, '&:hover': {cursor: 'pointer'}}}>
              <Typography
                variant="body2"
                noWrap
                sx={{ color: theme.palette.primary.main, fontsize: 5}}
              >
                AW
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{ color: theme.palette.secondary.contrastText, '&:hover': {cursor: 'pointer'} }}
              >
                Express
              </Typography>
            </Stack>
              <Search sx={{display: 'flex', [theme.breakpoints.down('navBarSearch')]: {display: 'none'}}}>

                <Select
                  value={categoryMenuInput}
                  onChange={(event) => {
                    setCategoryMenuInput(event.target.value)
                  }}
                  sx={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
                >
                  {[...Array(11).keys()].map(
                    (value, key) => {
                      return (
                        <MenuItem key={value} value={CATEGORY_LIST[value]}>
                          {CATEGORY_LIST[value]}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>

                {user.userType && user.userType === 'admin' ?
                  <Select
                    value={statusMenuInput}
                    onChange={(event) => {setStatusMenuInput(event.target.value)}}
                    sx={{borderRadius: 0}}
                  >
                    {[...Array(4).keys()].map(
                      (value, key) => {
                        return (
                          <MenuItem key={value} value={STATUS_LIST[value]}>
                            {STATUS_LIST[value]}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                :
                  null
                }

                <Tooltip title="Advanced Search">
                  <IconButton onClick={handleSearchDrawer}>
                    <ManageSearchIcon/>
                  </IconButton>
                </Tooltip>

                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{'aria-label': 'search'}}
                  onChange={(event) => {
                    setSearchBarTextInput(event.target.value);
                  }}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      search();
                      event.preventDefault();
                    }
                  }}
                />

                <IconButton onClick={search}>
                  <SearchIcon/>
                </IconButton>

              </Search>
            <Box sx={{display: {xs: 'flex', md: 'flex', marginLeft: 'auto'}}}>
              <Tooltip title="Sell an Item">
                <IconButton
                  size="large"
                  aria-label="show 4 new mails"
                  sx={{
                    color: theme.palette.secondary.contrastText,
                    [theme.breakpoints.down('navBarSellIcon')]: {display: 'none'}
                  }}
                  onClick={() => router.push("/sell")}
                >
                  <Badge badgeContent={0} color="error">
                    <SellIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="View cart">
                <IconButton
                  size="large"
                  color="inherit"
                  sx={{color: theme.palette.secondary.contrastText}}
                  onClick={handleCart}
                >
                  <Badge badgeContent={amounts.cartItems} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                //aria-controls={menuId}
                aria-haspopup="true"
                //onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {session && <AccountMenu user={session.user}/>}

              </IconButton>
            </Box>
            {/*<Box sx={{display: {xs: 'flex', md: 'none'}}}>*/}
            {/*  <IconButton*/}
            {/*    size="large"*/}
            {/*    aria-label="show more"*/}
            {/*    //aria-controls={mobileMenuId}*/}
            {/*    aria-haspopup="true"*/}
            {/*    //onClick={handleMobileMenuOpen}*/}
            {/*    color="inherit"*/}
            {/*  >*/}
            {/*    <MoreIcon />*/}
            {/*  </IconButton>*/}
            {/*</Box>*/}
          </ToolbarStyle>
          <ToolbarStyle sx={{[theme.breakpoints.up('navBarSearch')]: {display: 'none'}}}>
            <Search sx={{display: 'flex'}}>

              <Select
                value={categoryMenuInput}
                onChange={(event) => {
                  setCategoryMenuInput(event.target.value)
                }}
                sx={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              >
                {[...Array(11).keys()].map(
                  (value, key) => {
                    return (
                      <MenuItem key={value} value={CATEGORY_LIST[value]}>
                        {CATEGORY_LIST[value]}
                      </MenuItem>
                    );
                  }
                )}
              </Select>

              <Tooltip title="Advanced Search">
                <IconButton onClick={handleSearchDrawer}>
                  <ManageSearchIcon/>
                </IconButton>
              </Tooltip>

              <StyledInputBase
                placeholder="Search…"
                inputProps={{'aria-label': 'search'}}
                onChange={(event) => {
                  setSearchBarTextInput(event.target.value);
                }}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    search();
                    event.preventDefault();
                  }
                }}
              />

              <IconButton onClick={search}>
                <SearchIcon/>
              </IconButton>

            </Search>
          </ToolbarStyle>
        </AppBar>
        <Drawer open={isDrawerOpen} handleDrawer={handleDrawer} />
        <Cart open={isCartOpen} cartQty={amounts.cartItems} cartItems={initialCart} handleCartChange={handleCartChange} subTotal={subTotal} handleCart={handleCart} />
        <Advanced open={isSearchDrawerOpen} handleSearchDrawer={handleSearchDrawer} advancedSearchParameters={advancedSearchParameters} setAdvancedSearchParameters={setAdvancedSearchParameters} advancedSearch={advancedSearch}/>
        <MainStyle sx={{
          left: isDrawerOpen ? `${DRAWER_WIDTH}px` : '0px',
          width: isDrawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          transition: 'width 0.1s, left 0.1s',
          transitionTimingFunction: 'ease-in-out',
        }}>
          {children}
        </MainStyle>
      </Box>
    );
  } else {
    return <></>
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getServerSession(
        context.req,
        context.res,
        authOptions
      )
    }
  }
}
