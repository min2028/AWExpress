import {
  SET_CART_ITEMS,
  SET_ORDER_ITEMS,
  SET_LISTING_ITEMS,
  SET_PENDING_ITEMS,
} from './types';
import axios from "axios";

export const updateAllAmounts = (userId, id_token) => async dispatch => {
  return axios.get(
    `/api/user/${userId}/productstatistics`,
    {headers: {'Content-Type': 'application/json', 'authorization': id_token}}
  ).then((response) => {
    if (response.status === 200) {
      // {"cart-items":0,"listings":0,"orders":0,"pending-orders":0, "sellPendingOrders": 0}
      const quantities = response.data;
      dispatch({type: SET_CART_ITEMS, payload: quantities['cart-items']});
      dispatch({type: SET_ORDER_ITEMS, payload: quantities['orders']});
      dispatch({type: SET_LISTING_ITEMS, payload: quantities['listings']});
      dispatch({type: SET_PENDING_ITEMS, payload: quantities['sellPendingOrders']});
    }
  }).catch((err) => {
    console.log(`Could not retrieve user statistics with error ${JSON.stringify(err.response.data)}`);
  })
}