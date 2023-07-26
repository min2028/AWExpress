import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Grow, keyframes, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

/*
Props:
productId: <char>
name: <char>
seller: <char>
picture: <url>
description: <char>
price: <double>
quantity: <char>

 */

export default function SpecialDealsCard(props) {
  const theme = useTheme();

  return (
    <Link href= {{
      pathname: '/product',
      query: {productId: props.productId}
    }}
    >
      <Card
        sx={{
          href: '/product',
          width: '170px',
          height: '200px',
          borderRadius: '0px',
          "&:hover": {
            backgroundColor: '#f5f5f5',
          },

        }}
      >
        <CardMedia
          sx={{
            objectFit: 'contain',
            width: '100%',
            height: '80px',
          }}
          component='img'
          image={props.picture}
          title={props.name}
        />
        <CardContent style={{ height: "50%" }}>
          <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box>
              <Typography
                noWrap
                style={{ fontSize: '14px', fontWeight: 'bold', color: theme.palette.secondary.main }}
              >
                {props.name.slice(0, 30)}
              </Typography>
              <Typography
                style={{ fontSize: '9px' }}
              >
                {(props.sellerFirstName || props.sellerLastName) && `Sold by: ${props.sellerFirstName} ${props.sellerLastName}`}
              </Typography>
            </Box>
            <Box>
              <Typography
                style={{ fontSize: '18px', fontWeight: 'bold', color: theme.palette.secondary.main}}
              >
                ${Number(props.price).toFixed(2)}
              </Typography>
              <Typography
                style={{ fontSize: '12px' }}
              >
                {props.availableQuantity} Available
              </Typography>
              <Typography
                style={{ fontSize: '10px' }}
              >
                In {props.category}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
