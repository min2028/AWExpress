import {createTheme} from "@mui/material/styles";


/*
To Use:
- Add another field/object if needed in the global theme. (eg, breakpoints, typography, sizes, etc)
- If making styled components outside a function, can access this by calling theme.palette.primary.main as an example
- If needed inside the function, must call "const theme = useTheme();" first before you can access.
 */
export const theme = createTheme({
    palette: {
        primary: {
            main: '#ed8929',
            alternate: '#f0e30a',
            alternateHover: '#b8af0d',
            light: '#fcbd71'
        },
        secondary: {
            main: '#242f3d',
            light: '#405169',
            lighter: '#556b87',
            dark: '#1d2633',
            contrastText: '#f5f5f5',
        },
        background: {
          default: '#e3e6e6'
        },
        error: {
            main: '#FF5C5C'
        }
    },
    breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
          likelyTouchScreen: 1181,
          loginLogoText: 520,
          navBarSearch: 710,
          navBarSellIcon: 352,
          sideDrawerFullWidth: 572,
          cartDrawerItemDisplay: 400,
          specialDepartmentDealsText: 404,
          advancedSearchDiplay: 706,
          productDetailsDisplay: 1279,
          productDetailsButtons: 767,
          productDetailsContainerMedium: 800,
          productDetailsContainerSmall: 500,
          orderHistoryNumberAndStatusText: 425,
          listingsFilterDisplay: 786,
          sellFormImagePreview: 538,
          cartItemDisplay: 1044,
          cartPriceDisplay: 798,
          cartItemDisplayVertical: 575,
          productModalMedium: 1050,
          productModalSmall: 760,
          productModalTiny: 415,
          messageModalSmall: 523,
          checkoutMedium: 982,
          checkoutSmall: 740,
          checkoutTiny: 372,
        },
    },
})